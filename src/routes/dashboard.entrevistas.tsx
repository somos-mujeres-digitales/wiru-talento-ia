import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Clock, Sparkles, ArrowRight, RotateCcw, Volume2, AlertCircle } from "lucide-react";
import { MOCK_INTERVIEW_QUESTIONS, MOCK_TARGET } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/entrevistas")({
  component: Interviews,
});

type Phase = "setup" | "live" | "done";

// Web Speech API types (vendor-prefixed)
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor() as SpeechRecognitionLike;
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-PE";
  u.rate = 1;
  u.pitch = 1;
  // Prefer Spanish voice if available
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  if (esVoice) u.voice = esVoice;
  u.onend = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

function Interviews() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef<string>("");

  // Init voices list (Chrome lazy-loads)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    setVoiceSupported(!!getRecognition());
  }, []);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Speak each new question automatically
  useEffect(() => {
    if (phase !== "live") return;
    setIsAgentSpeaking(true);
    speak(MOCK_INTERVIEW_QUESTIONS[qIdx], () => setIsAgentSpeaking(false));
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx]);

  const total = MOCK_INTERVIEW_QUESTIONS.length;
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const start = () => {
    setPhase("live");
    setQIdx(0);
    setAnswers([]);
    setCurrent("");
    setSeconds(0);
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
  };

  const startListening = () => {
    setVoiceError(null);
    const rec = getRecognition();
    if (!rec) {
      setVoiceError("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge en escritorio.");
      return;
    }
    rec.lang = "es-PE";
    rec.continuous = true;
    rec.interimResults = true;
    baseTextRef.current = current ? current.trimEnd() + " " : "";

    rec.onresult = (e: any) => {
      let finalText = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      setCurrent(baseTextRef.current + finalText + interim);
      if (finalText) baseTextRef.current += finalText;
    };
    rec.onerror = (e: any) => {
      const code = e?.error || "error";
      const map: Record<string, string> = {
        "not-allowed": "Necesitamos permiso de micrófono para escucharte.",
        "no-speech": "No te escuché. Inténtalo de nuevo.",
        "audio-capture": "No detecto un micrófono conectado.",
      };
      setVoiceError(map[code] || "Hubo un problema con el micrófono.");
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const replayQuestion = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsAgentSpeaking(true);
    speak(MOCK_INTERVIEW_QUESTIONS[qIdx], () => setIsAgentSpeaking(false));
  };

  const nextQ = () => {
    stopListening();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const next = [...answers, current];
    setAnswers(next);
    setCurrent("");
    if (qIdx + 1 >= total) setPhase("done");
    else setQIdx(qIdx + 1);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="label-tag text-primary">Simulación con IA</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        Simula tu entrevista en {MOCK_TARGET.company}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Practica con voz real: la IA te hace la pregunta en voz alta y tú respondes hablando.
      </p>

      {phase === "setup" && (
        <div className="mt-8 grid gap-6">
          <div className="surface-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-tag text-text-muted">Empresa</label>
                <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option>{MOCK_TARGET.company}</option>
                  <option>BCP</option>
                  <option>BBVA</option>
                </select>
              </div>
              <div>
                <label className="label-tag text-text-muted">Puesto</label>
                <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option>{MOCK_TARGET.role}</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="label-tag text-text-muted">Dificultad</label>
              <div className="mt-2 flex gap-2">
                {(["basico", "intermedio", "avanzado"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm capitalize transition ${
                      difficulty === d
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {!voiceSupported && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Tu navegador no soporta reconocimiento de voz. Aún podrás escuchar las preguntas y escribir tus respuestas. Para voz completa, usa Chrome o Edge.
                </span>
              </div>
            )}

            <button
              onClick={start}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Iniciar simulación <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, t: "Duración aprox.", v: "5–10 min" },
              { icon: Sparkles, t: "Preguntas", v: `${total} clásicas` },
              { icon: Mic, t: "Modo", v: "Voz + texto" },
            ].map((c) => (
              <div key={c.t} className="surface-card flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.t}</p>
                  <p className="text-sm font-medium">{c.v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "live" && (
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pregunta {qIdx + 1} de {total}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {fmt}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${((qIdx + 1) / total) * 100}%` }}
            />
          </div>

          <motion.div
            key={qIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 surface-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="label-tag text-primary">Entrevistador IA</p>
              <button
                onClick={replayQuestion}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition"
              >
                <Volume2 className={`h-3.5 w-3.5 ${isAgentSpeaking ? "text-primary" : ""}`} />
                {isAgentSpeaking ? "Hablando..." : "Repetir pregunta"}
              </button>
            </div>
            <h2 className="mt-2 text-xl font-medium leading-snug">
              {MOCK_INTERVIEW_QUESTIONS[qIdx]}
            </h2>
            {isAgentSpeaking && (
              <div className="mt-4 flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-1 rounded-full bg-primary"
                    animate={{ height: ["6px", "18px", "6px"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">La IA te está hablando…</span>
              </div>
            )}
          </motion.div>

          <textarea
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              baseTextRef.current = e.target.value;
            }}
            rows={6}
            placeholder={isListening ? "Escuchando... habla con naturalidad" : "Habla pulsando el botón, o escribe aquí tu respuesta..."}
            className="mt-4 w-full resize-none rounded-xl border border-border bg-surface p-4 text-sm outline-none focus:border-primary"
          />

          {voiceError && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {voiceError}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!voiceSupported || isAgentSpeaking}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition disabled:opacity-40 ${
                isListening
                  ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : "border border-border bg-surface hover:bg-surface-elevated"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" /> Detener
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-primary" /> Responder por voz
                </>
              )}
              {isListening && (
                <motion.span
                  className="ml-1 h-2 w-2 rounded-full bg-destructive-foreground"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </button>
            <button
              onClick={nextQ}
              disabled={!current.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-40"
            >
              {qIdx + 1 === total ? "Finalizar" : "Siguiente pregunta"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-8">
          <div className="surface-card flex flex-col items-center p-8 text-center">
            <div className="text-5xl font-semibold gradient-text">82</div>
            <p className="mt-1 text-sm text-muted-foreground">Puntaje de entrevista</p>
            <p className="mt-3 max-w-md text-sm">
              ¡Buena entrevista! Mostraste claridad y motivación. Para destacar más, agrega ejemplos
              concretos de tu experiencia previa.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Claridad de respuestas", v: 85 },
              { name: "Conocimiento del puesto", v: 78 },
              { name: "Comunicación", v: 88 },
              { name: "Seguridad y confianza", v: 76 },
            ].map((s) => (
              <div key={s.name} className="surface-card p-4">
                <p className="label-tag text-text-muted">{s.name}</p>
                <p className="mt-2 text-2xl font-semibold">{s.v}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.v}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {answers.length > 0 && (
            <div className="mt-6 surface-card p-5">
              <p className="label-tag text-text-muted">Tus respuestas</p>
              <div className="mt-3 space-y-4">
                {answers.map((a, i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground">
                      {i + 1}. {MOCK_INTERVIEW_QUESTIONS[i]}
                    </p>
                    <p className="mt-1 text-sm">{a || <span className="italic text-muted-foreground">(sin respuesta)</span>}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              <RotateCcw className="h-4 w-4" /> Repetir simulación
            </button>
            <a
              href="/dashboard/postulaciones"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-elevated transition"
            >
              Ver mis postulaciones
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
