import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, FileEdit, Lock, Sparkles, Upload } from "lucide-react";
import { DemoUpgradeButton, ProBadge } from "@/components/demo-mode";
import { useDemoMode } from "@/lib/demo-mode";
import { MOCK_TARGET } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/")({
  component: MisPasos,
});

const STATS = [
  { label: "Score de perfil", value: "—", hint: "Aún sin CV" },
  { label: "Vacantes con match", value: "0", hint: "Sube tu CV" },
  { label: "Créditos disponibles", value: "1", hint: "Plan Free" },
  { label: "Pasos completados", value: "0/5", hint: "Empieza ahora" },
];

const STEPS = [
  {
    n: 1,
    state: "active" as const,
    title: "Descubre tu perfil profesional",
    desc: "Sube tu CV o créalo desde cero para analizar tu potencial",
    actions: [
      { label: "Subir mi CV", to: "/dashboard/analysis", primary: true, icon: Upload },
      { label: "Crear CV desde cero", to: "/dashboard/cv", primary: false, icon: FileEdit },
    ],
    tags: ["Tu score de perfil", "Vacantes con match", "Tu análisis personalizado"],
  },
  {
    n: 2,
    state: "locked" as const,
    title: "Optimiza tu CV con IA",
    desc: "Análisis detallado y textos mejorados para tu CV",
  },
  {
    n: 3,
    state: "locked" as const,
    title: "Encuentra vacantes con match",
    desc: "Empleos alineados a tu perfil y nivel en Cusco",
  },
  {
    n: 4,
    state: "locked" as const,
    title: "Simula tu entrevista",
    desc: "Practica con IA las preguntas reales de la empresa",
  },
  {
    n: 5,
    state: "pro" as const,
    title: "Lleva tu aplicación al siguiente nivel",
    desc: "Tracker completo · alertas · acceso a todas las vacantes",
  },
];

export default function MisPasos() {
  const { isPro } = useDemoMode();

  const steps = STEPS.map((step) =>
    isPro && step.state === "locked"
      ? {
          ...step,
          state: "pro" as const,
          desc: "Vista premium desbloqueada con datos y automatizaciones demo.",
        }
      : step,
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-tag text-primary">Búsqueda activa</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {MOCK_TARGET.role} en {MOCK_TARGET.company}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isPro ? <ProBadge /> : <DemoUpgradeButton label="Pasar a Pro" />}
          <button className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15">
            <Sparkles className="h-4 w-4" /> Guía con IA
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="surface-card p-4">
            <p className="label-tag text-text-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-xl border p-5 ${
              s.state === "active"
                ? "border-primary/50 bg-primary/5"
                : s.state === "pro"
                  ? "border-success/30 bg-surface"
                  : "border-border bg-surface opacity-80"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  s.state === "active"
                    ? "bg-primary text-primary-foreground"
                    : s.state === "pro"
                      ? "bg-success/15 text-success"
                      : "bg-border text-muted-foreground"
                }`}
              >
                {s.state === "locked" ? (
                  <Lock className="h-4 w-4" />
                ) : s.state === "pro" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  s.n
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="label-tag text-text-muted">Paso {s.n}</p>
                  {s.state === "active" && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      ACTIVO AHORA
                    </span>
                  )}
                  {s.state === "pro" && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                      Plan PRO Activo
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-lg font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>

                {s.state === "active" && (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.actions!.map((a) => (
                        <Link
                          key={a.label}
                          to={a.to}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                            a.primary
                              ? "bg-primary text-primary-foreground hover:opacity-90"
                              : "border border-border bg-surface hover:bg-surface-elevated"
                          }`}
                        >
                          <a.icon className="h-4 w-4" />
                          {a.label}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.tags!.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {s.state === "pro" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {[
                      { label: "Analítica", value: "98%", note: "match promedio" },
                      { label: "Automatización", value: "24/7", note: "emails y CRM" },
                      { label: "Exportaciones", value: "∞", note: "PDF / DOCX / CSV" },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-border bg-background p-4"
                      >
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
                        <p className="mt-1 text-xs text-text-muted">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isPro && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="surface-card p-5">
            <p className="label-tag text-primary">Panel PRO</p>
            <h3 className="mt-2 text-lg font-medium">Flujo premium desbloqueado</h3>
            <div className="mt-4 space-y-3">
              {[
                { k: "CV score", v: "91/100" },
                { k: "Vacantes sugeridas", v: "12 nuevas" },
                { k: "Alertas", v: "Activadas" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{row.k}</span>
                  <span className="font-medium">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-5">
            <p className="label-tag text-primary">Historial detallado</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["CV actualizado", "hoy 10:42"],
                ["Correo automático enviado", "hoy 10:43"],
                ["Sincronizado con CRM", "hoy 10:43"],
              ].map(([title, time]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                >
                  <span>{title}</span>
                  <span className="text-muted-foreground">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
