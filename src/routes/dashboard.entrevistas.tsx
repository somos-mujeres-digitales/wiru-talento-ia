import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Clock, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { MOCK_INTERVIEW_QUESTIONS, MOCK_TARGET } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/entrevistas")({
  component: Interviews,
});

type Phase = "setup" | "live" | "done";

function Interviews() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<"basico" | "intermedio" | "avanzado">("intermedio");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const total = MOCK_INTERVIEW_QUESTIONS.length;
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const start = () => {
    setPhase("live");
    setQIdx(0);
    setAnswers([]);
    setCurrent("");
    setSeconds(0);
  };

  const nextQ = () => {
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
        Practica con IA antes del día real. Las preguntas están basadas en el proceso real de la empresa.
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
            <button
              onClick={start}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Iniciar simulación <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, t: "Duración aprox.", v: "10 min" },
              { icon: Sparkles, t: "Preguntas", v: "5–8" },
              { icon: Mic, t: "Feedback", v: "Inmediato" },
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
            <p className="label-tag text-primary">Entrevistador IA</p>
            <h2 className="mt-2 text-xl font-medium leading-snug">
              {MOCK_INTERVIEW_QUESTIONS[qIdx]}
            </h2>
          </motion.div>

          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            rows={6}
            placeholder="Escribe tu respuesta aquí..."
            className="mt-4 w-full resize-none rounded-xl border border-border bg-surface p-4 text-sm outline-none focus:border-primary"
          />

          <div className="mt-3 flex items-center justify-between">
            <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-elevated transition">
              <Mic className="h-4 w-4 text-primary" /> Responder por voz
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
