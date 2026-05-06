import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, PhoneOff, Phone, Loader2, AlertCircle, Volume2,
  CheckCircle2, AlertTriangle, Sparkles, Activity, Settings2,
} from "lucide-react";
import { getVapiConfig } from "@/server/vapi.functions";
import { MOCK_TARGET, MOCK_INTERVIEW_DETAILS, SPANISH_FILLERS } from "@/lib/mockData";

type Status = "idle" | "loading" | "connecting" | "live" | "ended" | "error";
type Msg = { role: "assistant" | "user"; text: string; ts: number };

function buildSystemPrompt(company: string, role: string) {
  return `Eres Sofía, entrevistadora senior de RR.HH. de ${company} en Cusco, Perú. Estás entrevistando a una candidata joven (18–28 años) para el puesto de "${role}".

Reglas:
- Habla siempre en español peruano, tono cálido pero profesional. Frases cortas.
- Inicia con un saludo breve y la primera pregunta. NO te presentes con párrafos largos.
- Haz EXACTAMENTE estas 3 preguntas, en este orden, una a la vez:
  1) "Cuéntame sobre ti: ¿quién eres, qué estudiaste y por qué quieres trabajar en ${company}?"
  2) "Cuéntame una experiencia de liderazgo: ¿cómo la resolviste, primero como integrante del equipo y luego como líder?"
  3) "¿Cómo trabajas en equipo? Dame un ejemplo concreto donde tuvieron una diferencia y cómo llegaron a un acuerdo."
- Después de cada respuesta, haz UNA repregunta breve y específica relacionada con lo que dijo (máx 1 oración), luego pasa a la siguiente pregunta.
- Si la candidata divaga >40s, interrúmpela amablemente: "Perfecto, vamos al siguiente punto."
- Cuando termine la 3ª pregunta + repregunta, despídete: "Gracias [nombre si lo sabes], cerramos aquí. Pronto te llegará feedback." y termina la llamada.
- NUNCA des feedback durante la entrevista. Eres entrevistadora, no coach.
- NO menciones que eres IA. Actúa como humana.`;
}

function buildAssistantOverrides(company: string, role: string) {
  return {
    name: "Sofía — Entrevistadora",
    firstMessage: `Hola, soy Sofía de ${company}. Gracias por tu tiempo. Vamos a empezar: cuéntame sobre ti, ¿quién eres, qué estudiaste y por qué quieres trabajar con nosotros?`,
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: buildSystemPrompt(company, role) }],
      temperature: 0.6,
    },
    voice: {
      provider: "11labs",
      voiceId: "FGY2WhTYpPnrIDTdsKH5", // Laura - Spanish-friendly
      model: "eleven_multilingual_v2",
      stability: 0.55,
      similarityBoost: 0.75,
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "es",
    },
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
  };
}

// Quick analysis used after the call (mirrors the simulator)
function analyze(text: string) {
  const lower = (text || "").toLowerCase();
  const tokens = lower.split(/\s+/).filter(Boolean);
  const fillers = SPANISH_FILLERS
    .map((f) => ({ word: f, count: (lower.match(new RegExp(`\\b${f}\\b`, "g")) || []).length }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerCount = fillers.reduce((a, b) => a + b.count, 0);
  const star = {
    S: /\b(situaci[oó]n|cuando|durante|en\s+(la|el|mi))/.test(lower),
    T: /\b(tarea|objetivo|meta|reto|deb[ií]a)\b/.test(lower),
    A: /\b(propuse|organic[eé]|coordin[eé]|implement[eé]|lider[eé]|hice)\b/.test(lower),
    R: /\b(result|logr|cerr|aument|reduj|\d+\s*%)/.test(lower),
  };
  const starHits = Object.values(star).filter(Boolean).length;
  const claridad = Math.max(40, Math.min(98, 90 - fillerCount * 4));
  const estructura = Math.max(40, Math.min(98, 50 + starHits * 12));
  const confianza = Math.max(40, Math.min(96, 88 - fillerCount * 3));
  const relevancia = Math.max(50, Math.min(98, 60 + Math.min(30, tokens.length / 4)));
  const total = Math.round((claridad + estructura + confianza + relevancia) / 4);
  return { fillers, fillerCount, star, starHits, claridad, estructura, confianza, relevancia, total, words: tokens.length };
}

export default function VapiInterview({ onConfigMissing }: { onConfigMissing?: () => void }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{ publicKey: string; assistantId: string; configured: boolean } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    getVapiConfig()
      .then((c) => {
        setConfig(c);
        if (!c.configured) {
          setStatus("idle");
          onConfigMissing?.();
        } else {
          setStatus("idle");
        }
      })
      .catch(() => setStatus("error"));
  }, [onConfigMissing]);

  useEffect(() => {
    if (status !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const start = async () => {
    if (!config?.publicKey) return;
    setError(null);
    setMessages([]);
    setSeconds(0);
    setStatus("connecting");

    try {
      const vapi = new Vapi(config.publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("live"));
      vapi.on("call-end", () => {
        setStatus("ended");
        setIsAssistantSpeaking(false);
      });
      vapi.on("speech-start", () => setIsAssistantSpeaking(true));
      vapi.on("speech-end", () => setIsAssistantSpeaking(false));
      vapi.on("volume-level", (v: number) => setVolume(v));
      vapi.on("message", (m: any) => {
        if (m.type === "transcript" && m.transcriptType === "final") {
          setMessages((prev) => [
            ...prev,
            { role: m.role === "assistant" ? "assistant" : "user", text: m.transcript, ts: Date.now() },
          ]);
        }
      });
      vapi.on("error", (e: any) => {
        console.error("VAPI error", e);
        setError(e?.errorMsg || e?.message || "Error en la llamada con VAPI.");
        setStatus("error");
      });

      // Use assistantId if provided, otherwise inline overrides
      const overrides = buildAssistantOverrides(MOCK_TARGET.company, MOCK_TARGET.role);
      if (config.assistantId) {
        await vapi.start(config.assistantId, { variableValues: { company: MOCK_TARGET.company, role: MOCK_TARGET.role } });
      } else {
        await vapi.start(overrides as any);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "No se pudo iniciar la llamada.");
      setStatus("error");
    }
  };

  const stop = () => {
    try { vapiRef.current?.stop(); } catch {}
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    const next = !muted;
    vapiRef.current.setMuted(next);
    setMuted(next);
  };

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const userText = messages.filter((m) => m.role === "user").map((m) => m.text).join(" ");
  const analysis = analyze(userText);

  // ---- Not configured banner ----
  if (config && !config.configured) {
    return (
      <div className="surface-card p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-warning/15 p-2 text-warning"><Settings2 className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="font-medium">Voz IA por VAPI · pendiente de configurar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Para habilitar entrevistas con voz IA en tiempo real (latencia &lt;500ms, voz natural en español),
              añade tus credenciales VAPI como variables de entorno del proyecto:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <code className="rounded bg-surface px-2 py-0.5 text-primary">VAPI_PUBLIC_KEY</code>
                <span className="text-muted-foreground">— tu Public Key del dashboard de VAPI</span>
              </li>
              <li className="flex items-center gap-2">
                <code className="rounded bg-surface px-2 py-0.5 text-primary">VAPI_ASSISTANT_ID</code>
                <span className="text-muted-foreground">— opcional, si ya creaste un assistant en VAPI</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Si no configuras <code>VAPI_ASSISTANT_ID</code>, usaremos un assistant inline con prompt para
              "Sofía, entrevistadora de {MOCK_TARGET.company}", voz ElevenLabs en español y modelo GPT-4o-mini.
            </p>
            <p className="mt-3 text-xs">
              Mientras tanto, puedes usar el simulador local que ya está abajo 👇
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Live UI ----
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-semibold text-sm">S</div>
            {status === "live" && (
              <motion.span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Sofía · Entrevistadora IA</p>
            <p className="text-xs text-muted-foreground">
              {status === "idle" && "Lista para empezar"}
              {status === "connecting" && "Conectando con VAPI..."}
              {status === "live" && <><span className="text-success">● En llamada</span> · {fmt}</>}
              {status === "ended" && "Llamada finalizada"}
              {status === "error" && <span className="text-destructive">Error</span>}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Powered by VAPI
        </span>
      </div>

      {/* Visual */}
      <div className="relative flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5"
          animate={{ scale: isAssistantSpeaking ? [1, 1.06, 1] : 1 }}
          transition={{ duration: 0.6, repeat: isAssistantSpeaking ? Infinity : 0 }}
        >
          <AnimatePresence>
            {(status === "live" || isAssistantSpeaking) && (
              <>
                <motion.span className="absolute inset-0 rounded-full border-2 border-primary/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.span className="absolute inset-0 rounded-full border-2 border-primary/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
              </>
            )}
          </AnimatePresence>
          <div className="flex items-end gap-1">
            {[0,1,2,3,4].map((i) => (
              <motion.span key={i} className="block w-1.5 rounded-full bg-primary"
                animate={{
                  height: isAssistantSpeaking ? [8, 28, 12, 32, 10][i] : status === "live" ? 8 + volume * 30 : 8,
                }}
                transition={{ duration: 0.4, repeat: isAssistantSpeaking ? Infinity : 0, repeatType: "reverse", delay: i * 0.07 }} />
            ))}
          </div>
        </motion.div>
        <p className="mt-4 text-sm text-muted-foreground">
          {status === "idle" && "Pulsa el botón para empezar la entrevista por voz"}
          {status === "connecting" && "Conectando..."}
          {status === "live" && (isAssistantSpeaking ? "Sofía está hablando..." : "Sofía te escucha")}
          {status === "ended" && "Entrevista terminada · revisa tu feedback abajo"}
        </p>

        <div className="mt-6 flex items-center gap-3">
          {status === "idle" || status === "ended" || status === "error" ? (
            <button onClick={start} disabled={!config?.configured}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
              <Phone className="h-4 w-4" /> {status === "ended" ? "Repetir entrevista" : "Empezar entrevista por voz"}
            </button>
          ) : status === "connecting" ? (
            <button disabled className="inline-flex items-center gap-2 rounded-full bg-primary/70 px-6 py-3 text-sm font-medium text-primary-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Conectando...
            </button>
          ) : (
            <>
              <button onClick={toggleMute}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm hover:bg-surface-elevated transition">
                {muted ? <><MicOff className="h-4 w-4 text-destructive" /> Activar mic</> : <><Mic className="h-4 w-4 text-primary" /> Silenciar</>}
              </button>
              <button onClick={stop}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground hover:opacity-90 transition">
                <PhoneOff className="h-4 w-4" /> Terminar
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}
      </div>

      {/* Live transcript */}
      {(status === "live" || status === "ended") && messages.length > 0 && (
        <div className="border-t border-border bg-surface/50 p-5">
          <p className="label-tag text-text-muted inline-flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" /> Transcripción en vivo
          </p>
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 text-sm ${m.role === "assistant" ? "" : "justify-end"}`}>
                {m.role === "assistant" && (
                  <span className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center justify-center">S</span>
                )}
                <div className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                  m.role === "assistant" ? "bg-surface border border-border" : "bg-primary/15 text-foreground"
                }`}>{m.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Post-call feedback */}
      {status === "ended" && userText.length > 20 && (
        <div className="border-t border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-tag text-primary inline-flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Feedback de Sofía
            </p>
            <span className="text-2xl font-semibold gradient-text">{analysis.total}<span className="text-xs text-muted-foreground">/100</span></span>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {([
              ["Claridad", analysis.claridad],
              ["Estructura", analysis.estructura],
              ["Confianza", analysis.confianza],
              ["Relevancia", analysis.relevancia],
            ] as const).map(([n, v]) => (
              <div key={n} className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">{n}</p>
                <p className="mt-1 text-xl font-semibold">{v}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs">
              <p className="font-medium text-success inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Lo positivo</p>
              <ul className="mt-2 space-y-1 text-foreground">
                <li>· Hablaste {analysis.words} palabras en total.</li>
                {analysis.starHits >= 3 && <li>· Estructura STAR clara ({analysis.starHits}/4 elementos).</li>}
                {analysis.fillerCount < 3 && <li>· Pocas muletillas — sonaste segura.</li>}
              </ul>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs">
              <p className="font-medium text-warning inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Para mejorar</p>
              <ul className="mt-2 space-y-1 text-foreground">
                {analysis.fillerCount >= 3 && <li>· {analysis.fillerCount} muletillas: "{analysis.fillers[0]?.word}" ×{analysis.fillers[0]?.count}.</li>}
                {analysis.starHits < 3 && <li>· Faltó estructura STAR (Situación-Tarea-Acción-Resultado).</li>}
                {analysis.words < 80 && <li>· Respuestas muy cortas — desarrolla más cada idea.</li>}
                {analysis.fillerCount < 3 && analysis.starHits >= 3 && analysis.words >= 80 && <li>· Muy buen desempeño general 👏</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
