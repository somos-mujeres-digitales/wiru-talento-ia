import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Clock, Sparkles, ArrowRight, RotateCcw, Volume2, AlertCircle,
  CheckCircle2, AlertTriangle, Activity, Lightbulb, MessageCircle, TrendingUp,
} from "lucide-react";
import {
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_INTERVIEW_DETAILS,
  MOCK_TARGET,
  SPANISH_FILLERS,
} from "@/lib/mockData";
import VapiInterview from "@/components/VapiInterview";

export const Route = createFileRoute("/dashboard/entrevistas")({
  component: Interviews,
});

type Phase = "setup" | "live" | "review" | "done";

type SpeechRecognitionLike = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return Ctor ? (new Ctor() as SpeechRecognitionLike) : null;
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-PE"; u.rate = 1; u.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  if (esVoice) u.voice = esVoice;
  u.onend = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

// ---- Realistic answer analysis ----
type AnswerAnalysis = {
  words: number;
  durationSec: number;
  wpm: number;
  fillers: { word: string; count: number }[];
  fillerCount: number;
  keywordsHit: string[];
  keywordsMissed: string[];
  starDetected: { S: boolean; T: boolean; A: boolean; R: boolean };
  scores: { claridad: number; estructura: number; confianza: number; relevancia: number; total: number };
  pros: string[];
  cons: string[];
  durationLabel: "corta" | "ideal" | "larga";
};

function analyze(answer: string, durationSec: number, idx: number): AnswerAnalysis {
  const detail = MOCK_INTERVIEW_DETAILS[idx];
  const text = (answer || "").trim();
  const lower = text.toLowerCase();
  const tokens = lower.split(/\s+/).filter(Boolean);
  const words = tokens.length;
  const wpm = durationSec > 0 ? Math.round((words / durationSec) * 60) : 0;

  const fillers = SPANISH_FILLERS
    .map((f) => ({ word: f, count: (lower.match(new RegExp(`\\b${f}\\b`, "g")) || []).length }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerCount = fillers.reduce((a, b) => a + b.count, 0);

  const keywordsHit = detail.keywords.filter((k) => lower.includes(k.toLowerCase()));
  const keywordsMissed = detail.keywords.filter((k) => !keywordsHit.includes(k));

  // STAR heuristic
  const star = {
    S: /\b(situaci[oó]n|cuando|en\s+(la|el|mi)|durante|en\s+\d+)/.test(lower) || words > 25,
    T: /\b(tarea|objetivo|meta|reto|deb[ií]a|ten[ií]a que)\b/.test(lower),
    A: /\b(propuse|organic[eé]|coordin[eé]|implement[eé]|deleg[uú]e|lider[eé]|hice|dise[ñn][eé])\b/.test(lower),
    R: /\b(result|logr|cerr|aument|reduj|ahorr|\d+\s*%|\d+\s*(personas|cuentas|clientes))/.test(lower),
  };

  const [minD, maxD] = detail.expectedSeconds;
  const durationLabel: "corta" | "ideal" | "larga" =
    durationSec < minD ? "corta" : durationSec > maxD ? "larga" : "ideal";

  // Scores 0–100
  const wpmScore = wpm === 0 ? 30 : wpm < 90 ? 60 : wpm > 180 ? 65 : 95 - Math.abs(135 - wpm) * 0.4;
  const fillerPenalty = Math.min(40, fillerCount * 6);
  const claridad = Math.max(35, Math.min(98, Math.round(wpmScore - fillerPenalty + (words > 40 ? 5 : 0))));

  const starHits = Object.values(star).filter(Boolean).length;
  const estructuraBase = detail.starExpected ? starHits * 22 + 12 : starHits * 14 + 40;
  const estructura = Math.max(35, Math.min(98, Math.round(estructuraBase + (durationLabel === "ideal" ? 8 : -4))));

  const confianza = Math.max(40, Math.min(96, Math.round(80 - fillerPenalty * 0.6 + (wpm > 110 && wpm < 160 ? 10 : 0))));

  const relevancia = Math.max(40, Math.min(98, Math.round(50 + keywordsHit.length * 9)));

  const total = Math.round((claridad + estructura + confianza + relevancia) / 4);

  const pros: string[] = [];
  const cons: string[] = [];
  if (keywordsHit.length >= 2) pros.push(`Mencionaste términos clave: ${keywordsHit.slice(0, 3).join(", ")}.`);
  if (durationLabel === "ideal") pros.push(`Duración perfecta (${durationSec}s, en el rango ${minD}–${maxD}s).`);
  if (detail.starExpected && starHits >= 3) pros.push("Estructura tipo STAR detectada (S-T-A-R).");
  if (/\d+\s*%|\d{2,}/.test(text)) pros.push("Cuantificaste tu impacto con números — los reclutadores aman esto.");
  if (wpm >= 110 && wpm <= 160) pros.push(`Buen ritmo: ${wpm} palabras por minuto.`);

  if (fillerCount >= 3) cons.push(`Muchas muletillas (${fillerCount}): "${fillers.slice(0, 2).map((f) => f.word).join('", "')}".`);
  if (durationLabel === "corta") cons.push(`Respuesta corta (${durationSec}s). Apunta a ${minD}–${maxD}s.`);
  if (durationLabel === "larga") cons.push(`Te extendiste (${durationSec}s). Sintetiza a ${minD}–${maxD}s.`);
  if (detail.starExpected && starHits < 3) cons.push("Falta estructura STAR: agrega Tarea o Resultado cuantificable.");
  if (keywordsMissed.length > 2) cons.push(`No mencionaste: ${keywordsMissed.slice(0, 3).join(", ")}.`);
  if (wpm > 180) cons.push("Hablas muy rápido — respira entre ideas.");
  if (wpm > 0 && wpm < 90) cons.push("Ritmo lento — pierde atención del entrevistador.");

  if (pros.length === 0) pros.push("Buen primer intento, hay base para mejorar.");
  if (cons.length === 0) cons.push("Pulir matices: variedad de ejemplos y tono.");

  return { words, durationSec, wpm, fillers, fillerCount, keywordsHit, keywordsMissed, starDetected: star, scores: { claridad, estructura, confianza, relevancia, total }, pros, cons, durationLabel };
}

function Interviews() {
  const [mode, setMode] = useState<"vapi" | "local">("vapi");
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [durations, setDurations] = useState<number[]>([]);
  const [current, setCurrent] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [answerStart, setAnswerStart] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [liveLevel, setLiveLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef<string>("");

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

  // animate live wave when listening
  useEffect(() => {
    if (!isListening) { setLiveLevel(0); return; }
    const t = setInterval(() => setLiveLevel(Math.random()), 120);
    return () => clearInterval(t);
  }, [isListening]);

  useEffect(() => {
    if (phase !== "live") return;
    setIsAgentSpeaking(true);
    setAnswerStart(Date.now());
    speak(MOCK_INTERVIEW_QUESTIONS[qIdx], () => setIsAgentSpeaking(false));
    return () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx]);

  const total = MOCK_INTERVIEW_QUESTIONS.length;
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const liveAnalysis = useMemo(() => {
    const dur = answerStart ? Math.max(1, Math.round((Date.now() - answerStart) / 1000)) : 1;
    return analyze(current, dur, qIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, qIdx, seconds]);

  const start = () => {
    setPhase("live"); setQIdx(0); setAnswers([]); setDurations([]); setCurrent(""); setSeconds(0);
  };

  const stopListening = () => { try { recognitionRef.current?.stop(); } catch {} setIsListening(false); };

  const startListening = () => {
    setVoiceError(null);
    const rec = getRecognition();
    if (!rec) { setVoiceError("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge."); return; }
    rec.lang = "es-PE"; rec.continuous = true; rec.interimResults = true;
    baseTextRef.current = current ? current.trimEnd() + " " : "";
    rec.onresult = (e: any) => {
      let finalText = ""; let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " "; else interim += t;
      }
      setCurrent(baseTextRef.current + finalText + interim);
      if (finalText) baseTextRef.current += finalText;
    };
    rec.onerror = (e: any) => {
      const map: Record<string, string> = {
        "not-allowed": "Necesitamos permiso de micrófono.",
        "no-speech": "No te escuché. Inténtalo de nuevo.",
        "audio-capture": "No detecto un micrófono.",
      };
      setVoiceError(map[e?.error] || "Hubo un problema con el micrófono.");
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try { rec.start(); setIsListening(true); } catch { setIsListening(false); }
  };

  const replayQuestion = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsAgentSpeaking(true);
    speak(MOCK_INTERVIEW_QUESTIONS[qIdx], () => setIsAgentSpeaking(false));
  };

  const goReview = () => {
    stopListening();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const dur = answerStart ? Math.max(1, Math.round((Date.now() - answerStart) / 1000)) : 1;
    setAnswers((a) => [...a, current]);
    setDurations((d) => [...d, dur]);
    setPhase("review");
  };

  const continueNext = () => {
    setCurrent("");
    if (qIdx + 1 >= total) setPhase("done");
    else { setQIdx(qIdx + 1); setPhase("live"); }
  };

  // ---- UI ----
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="label-tag text-primary">Simulación con IA</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        Simula tu entrevista en {MOCK_TARGET.company}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        IA con voz real, análisis vivo de tu respuesta y feedback estilo entrevistador profesional.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-border bg-surface p-1 text-sm">
        <button onClick={() => setMode("vapi")}
          className={`rounded-full px-4 py-1.5 transition ${mode === "vapi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          🎙 Voz IA real (VAPI)
        </button>
        <button onClick={() => setMode("local")}
          className={`rounded-full px-4 py-1.5 transition ${mode === "local" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          💬 Simulador local
        </button>
      </div>

      {mode === "vapi" && (
        <div className="mt-6">
          <VapiInterview />
        </div>
      )}

      {mode === "local" && (<></>)}

      {mode === "local" && phase === "setup" && (
        <div className="mt-8 grid gap-6">
          <div className="surface-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-tag text-text-muted">Empresa</label>
                <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option>{MOCK_TARGET.company}</option><option>BCP</option><option>BBVA</option>
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
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm capitalize transition ${
                      difficulty === d ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            {!voiceSupported && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Tu navegador no soporta voz. Aún puedes escribir tu respuesta. Usa Chrome o Edge para voz completa.</span>
              </div>
            )}
            <button onClick={start} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              Iniciar simulación <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, t: "Duración aprox.", v: "5–10 min" },
              { icon: Sparkles, t: "Preguntas", v: `${total} clásicas` },
              { icon: Activity, t: "Análisis", v: "En tiempo real" },
            ].map((c) => (
              <div key={c.t} className="surface-card flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><c.icon className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">{c.t}</p><p className="text-sm font-medium">{c.v}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "local" && phase === "live" && (
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pregunta {qIdx + 1} de {total} · <span className="text-primary">{MOCK_INTERVIEW_DETAILS[qIdx].intent}</span></span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {fmt}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div className="h-full bg-primary" animate={{ width: `${((qIdx + 1) / total) * 100}%` }} />
          </div>

          <motion.div key={qIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 surface-card p-6">
            <div className="flex items-center justify-between">
              <p className="label-tag text-primary">Entrevistador IA · Sofía</p>
              <button onClick={replayQuestion}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition">
                <Volume2 className={`h-3.5 w-3.5 ${isAgentSpeaking ? "text-primary" : ""}`} />
                {isAgentSpeaking ? "Hablando..." : "Repetir pregunta"}
              </button>
            </div>
            <h2 className="mt-2 text-xl font-medium leading-snug">{MOCK_INTERVIEW_QUESTIONS[qIdx]}</h2>

            {isAgentSpeaking && (
              <div className="mt-4 flex items-center gap-1.5">
                {[0,1,2,3,4,5,6].map((i) => (
                  <motion.span key={i} className="block w-1 rounded-full bg-primary"
                    animate={{ height: ["6px","20px","6px"] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.08 }} />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">Sofía está hablando…</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                ⏱ Apunta a {MOCK_INTERVIEW_DETAILS[qIdx].expectedSeconds[0]}–{MOCK_INTERVIEW_DETAILS[qIdx].expectedSeconds[1]}s
              </span>
              {MOCK_INTERVIEW_DETAILS[qIdx].starExpected && (
                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[11px] text-warning">★ Usa método STAR</span>
              )}
            </div>
          </motion.div>

          <textarea value={current}
            onChange={(e) => { setCurrent(e.target.value); baseTextRef.current = e.target.value; }}
            rows={6}
            placeholder={isListening ? "Escuchando... habla con naturalidad" : "Habla pulsando el botón, o escribe aquí tu respuesta..."}
            className="mt-4 w-full resize-none rounded-xl border border-border bg-surface p-4 text-sm outline-none focus:border-primary" />

          {voiceError && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />{voiceError}
            </div>
          )}

          {/* Live analysis bar */}
          {current.trim().length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 surface-card p-4">
              <div className="flex items-center justify-between">
                <p className="label-tag text-text-muted inline-flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Análisis en vivo
                </p>
                <span className="text-xs text-muted-foreground">
                  {liveAnalysis.words} palabras · {liveAnalysis.wpm || "—"} ppm · {liveAnalysis.durationSec}s
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {([
                  ["Claridad", liveAnalysis.scores.claridad],
                  ["Estructura", liveAnalysis.scores.estructura],
                  ["Confianza", liveAnalysis.scores.confianza],
                  ["Relevancia", liveAnalysis.scores.relevancia],
                ] as const).map(([n, v]) => (
                  <div key={n}>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{n}</span><span className="font-medium text-foreground">{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                      <motion.div className="h-full bg-primary" animate={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {(liveAnalysis.fillerCount > 0 || liveAnalysis.keywordsHit.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {liveAnalysis.keywordsHit.map((k) => (
                    <span key={k} className="rounded-full bg-success/15 px-2 py-0.5 text-success">✓ {k}</span>
                  ))}
                  {liveAnalysis.fillers.slice(0, 3).map((f) => (
                    <span key={f.word} className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">"{f.word}" ×{f.count}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={isListening ? stopListening : startListening}
              disabled={!voiceSupported || isAgentSpeaking}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition disabled:opacity-40 ${
                isListening ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : "border border-border bg-surface hover:bg-surface-elevated"
              }`}>
              {isListening ? (<><MicOff className="h-4 w-4" /> Detener</>) : (<><Mic className="h-4 w-4 text-primary" /> Responder por voz</>)}
              {isListening && (
                <span className="ml-1 flex items-end gap-0.5">
                  {[0,1,2,3].map((i) => (
                    <motion.span key={i} className="block w-0.5 rounded-full bg-destructive-foreground"
                      animate={{ height: [4, 4 + liveLevel * 14, 4] }}
                      transition={{ duration: 0.3, delay: i * 0.05 }} />
                  ))}
                </span>
              )}
            </button>
            <button onClick={goReview} disabled={!current.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-40">
              Enviar respuesta <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {mode === "local" && phase === "review" && (() => {
        const a = analyze(answers[qIdx] || "", durations[qIdx] || 1, qIdx);
        const detail = MOCK_INTERVIEW_DETAILS[qIdx];
        return (
          <AnimatePresence>
            <motion.div key={`r${qIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5">
              <div className="surface-card p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="label-tag text-primary">Feedback de Sofía · pregunta {qIdx + 1} de {total}</p>
                    <h2 className="mt-1 text-xl font-medium">{MOCK_INTERVIEW_QUESTIONS[qIdx]}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-semibold gradient-text">{a.scores.total}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {([
                    ["Claridad", a.scores.claridad],
                    ["Estructura", a.scores.estructura],
                    ["Confianza", a.scores.confianza],
                    ["Relevancia", a.scores.relevancia],
                  ] as const).map(([n, v]) => (
                    <div key={n} className="rounded-lg border border-border p-3">
                      <p className="text-[11px] text-muted-foreground">{n}</p>
                      <p className="mt-1 text-2xl font-semibold">{v}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-medium">{a.durationSec}s · <span className={a.durationLabel === "ideal" ? "text-success" : "text-warning"}>{a.durationLabel}</span></p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Ritmo</p>
                    <p className="font-medium">{a.wpm} palabras/min</p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Muletillas</p>
                    <p className="font-medium">{a.fillerCount} {a.fillerCount > 0 && <span className="text-warning">• "{a.fillers[0].word}" ×{a.fillers[0].count}</span>}</p>
                  </div>
                </div>

                {detail.starExpected && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Método STAR detectado:</p>
                    <div className="flex gap-2">
                      {(["S","T","A","R"] as const).map((k) => {
                        const labels = { S: "Situación", T: "Tarea", A: "Acción", R: "Resultado" };
                        const ok = a.starDetected[k];
                        return (
                          <div key={k} className={`flex-1 rounded-lg border p-2 text-center text-xs ${ok ? "border-success/40 bg-success/10 text-success" : "border-border bg-surface text-muted-foreground"}`}>
                            <span className="block text-base font-semibold">{k}</span>
                            <span>{labels[k]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="surface-card p-5">
                  <p className="label-tag text-success inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Lo que hiciste bien</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {a.pros.map((p, i) => (
                      <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-success" /><span>{p}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="surface-card p-5">
                  <p className="label-tag text-warning inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Para mejorar</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {a.cons.map((p, i) => (
                      <li key={i} className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning" /><span>{p}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="label-tag text-primary inline-flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Respuesta ideal sugerida</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">"{detail.idealAnswer}"</p>
                <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                  <p className="text-primary font-medium inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> Sofía repreguntaría:</p>
                  <p className="mt-1 text-foreground">"{detail.followUp}"</p>
                </div>
              </div>

              <div className="surface-card p-5">
                <p className="label-tag text-text-muted">Tu respuesta transcrita</p>
                <p className="mt-2 text-sm">{answers[qIdx] || <span className="italic text-muted-foreground">(sin respuesta)</span>}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={continueNext}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                  {qIdx + 1 === total ? "Ver resultado final" : "Siguiente pregunta"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })()}

      {phase === "done" && (() => {
        const allAnalyses = answers.map((ans, i) => analyze(ans, durations[i] || 1, i));
        const avg = (k: keyof AnswerAnalysis["scores"]) =>
          Math.round(allAnalyses.reduce((s, x) => s + x.scores[k], 0) / Math.max(1, allAnalyses.length));
        const finalScore = avg("total");
        const verdict = finalScore >= 85 ? "Excelente" : finalScore >= 70 ? "Buena entrevista" : finalScore >= 55 ? "En camino" : "Necesita práctica";
        return (
          <div className="mt-8 space-y-5">
            <div className="surface-card flex flex-col items-center p-8 text-center">
              <div className="text-6xl font-semibold gradient-text">{finalScore}</div>
              <p className="mt-1 text-sm text-muted-foreground">Puntaje global</p>
              <p className="mt-2 text-lg font-medium">{verdict}</p>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Sofía analizó tus {total} respuestas evaluando claridad, estructura STAR, confianza vocal y relevancia para {MOCK_TARGET.company}.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {([
                ["Claridad", avg("claridad")],
                ["Estructura", avg("estructura")],
                ["Confianza", avg("confianza")],
                ["Relevancia", avg("relevancia")],
              ] as const).map(([n, v]) => (
                <div key={n} className="surface-card p-4">
                  <p className="label-tag text-text-muted">{n}</p>
                  <p className="mt-2 text-2xl font-semibold">{v}%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1 }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="surface-card p-5">
              <p className="label-tag text-primary inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Desglose por pregunta</p>
              <div className="mt-3 space-y-3">
                {allAnalyses.map((a, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium truncate">{i + 1}. {MOCK_INTERVIEW_QUESTIONS[i]}</p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{a.scores.total}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                      <span>{a.durationSec}s</span><span>·</span>
                      <span>{a.wpm} ppm</span><span>·</span>
                      <span>{a.fillerCount} muletillas</span><span>·</span>
                      <span>{a.keywordsHit.length}/{a.keywordsHit.length + a.keywordsMissed.length} palabras clave</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                <RotateCcw className="h-4 w-4" /> Repetir simulación
              </button>
              <a href="/dashboard/postulaciones"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-elevated transition">
                Ver mis postulaciones
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
