import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, Calendar, ExternalLink, Lock, Sparkles, ArrowRight } from "lucide-react";
import { MOCK_VACANCIES, MOCK_TARGET } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/vacantes")({
  component: Vacantes,
});

function Vacantes() {
  const [view, setView] = useState<"free" | "pro">("free");
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Vacantes en Cusco</h1>
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.95, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
            >
              Match realizado
            </motion.span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Empleos recomendados por IA para tu perfil activo.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-surface p-1 text-sm">
          {(["free", "pro"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1.5 transition ${
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Vista {v === "free" ? "Free" : "Pro"}
            </button>
          ))}
        </div>
      </div>

      {/* Improvement banner */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-warning" />
          <p className="text-sm">
            Tu match con <span className="font-medium">{MOCK_TARGET.company}</span> subiría de{" "}
            <span className="font-medium">51%</span> a <span className="font-medium text-success">74%</span>{" "}
            aplicando las 3 mejoras de tu CV.
          </p>
        </div>
        <Link
          to="/dashboard/analysis"
          className="inline-flex items-center gap-1 rounded-full bg-warning px-3 py-1.5 text-xs font-medium text-warning-foreground hover:opacity-90 transition"
        >
          Mejorar <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Vacancy cards */}
      <div className="mt-6 grid gap-4">
        {MOCK_VACANCIES.map((v, i) => {
          const locked = view === "free" && v.locked;
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative surface-card overflow-hidden p-5"
            >
              <div className={locked ? "blur-sm select-none pointer-events-none" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-background"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {v.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="label-tag text-text-muted">Empleo</span>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {v.match}% match
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-medium">{v.role}</h3>
                      <p className="text-sm text-muted-foreground">{v.company}</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                    Postular ahora <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{v.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {v.requirements.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {v.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Cierre: {v.closing}
                  </span>
                </div>
              </div>

              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" /> Vacante Pro
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {view === "free" && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-5 text-center">
          <p className="text-sm">
            Desbloquea las <span className="font-medium">3 vacantes restantes</span>
          </p>
          <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
            Activar Pro · S/ 14.90 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
