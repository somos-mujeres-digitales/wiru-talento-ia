import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Building2, Sparkles, Brain, Gauge, Users, Zap, Check,
  TrendingDown, Target, Clock, Shield, Bell, Play, BarChart3, Filter,
} from "lucide-react";
import { WiruLogo } from "@/components/WiruLogo";
import { PRICING_PLANS, COMPANY_CANDIDATES } from "@/lib/companyMockData";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Wiru IA for Companies — Talento ya evaluado por IA" },
      { name: "description", content: "Contrata talento de Cusco ya evaluado, entrenado y rankeado por IA. Reduce 70% tu tiempo de selección." },
      { property: "og:title", content: "Wiru IA for Companies" },
      { property: "og:description", content: "Sistema de inteligencia de talento. No es una bolsa de trabajo." },
    ],
  }),
  component: CompaniesLanding,
});

function CompaniesLanding() {
  const top3 = COMPANY_CANDIDATES.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <WiruLogo />
            <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary md:inline-flex">
              for Companies
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#producto" className="hover:text-foreground transition">Producto</a>
            <a href="#dashboard" className="hover:text-foreground transition">Dashboard</a>
            <a href="#planes" className="hover:text-foreground transition">Planes</a>
            <Link to="/" className="hover:text-foreground transition">Para candidatos</Link>
          </nav>
          <Link
            to="/empresas/dashboard"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Ver demo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-20 md:grid-cols-2 md:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted-foreground"
            >
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Wiru IA for Companies
            </motion.div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Contrata talento <span className="gradient-text">ya evaluado</span> por IA
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              No es una bolsa de trabajo. Es un sistema de inteligencia de talento: candidatos rankeados, entrevistados y listos para decidir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/empresas/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Probar el dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#planes" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm hover:bg-surface transition">
                Ver planes
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[
                { icon: TrendingDown, value: "-70%", label: "tiempo de selección" },
                { icon: Target, value: "94%", label: "match promedio" },
                { icon: Shield, value: "100%", label: "evaluado por IA" },
              ].map((s) => (
                <div key={s.label} className="surface-card p-4">
                  <s.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero mock — top candidatos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="surface-card p-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs text-muted-foreground">Vacante</p>
                <p className="text-sm font-semibold">Ejecutiva de Atención · Caja Cusco</p>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
                Top 5 generado
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {top3.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/50 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold" style={{ background: c.color, color: "var(--background)" }}>
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{c.match}%</p>
                    <p className="text-[10px] uppercase text-muted-foreground">match</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
              <Bell className="h-4 w-4 text-primary" />
              <span>Nueva candidata ideal disponible hace 2 min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diferenciación */}
      <section className="border-y border-border bg-surface/30 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-destructive">✕</span> No es una bolsa de trabajo &nbsp;·&nbsp;
            <span className="text-success">✓</span> Es un sistema de inteligencia de talento
          </p>
        </div>
      </section>

      {/* Producto */}
      <section id="producto" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-tight">Decide con datos, no con CVs</h2>
          <p className="mt-3 text-muted-foreground">Ve cómo responde cada candidato antes de invitarlo a entrevista real.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: "Ranking inteligente", desc: "La IA ordena automáticamente tu top 10 por vacante y aprende de tus decisiones." },
            { icon: Play, title: "Entrevistas pre-grabadas", desc: "Mira la simulación con IA del candidato: respuestas, claridad, confianza y estructura." },
            { icon: Filter, title: "Filtros avanzados", desc: "Por score, sector, habilidades técnicas y blandas. Encuentra al perfil exacto en segundos." },
            { icon: Zap, title: "Vacantes inteligentes", desc: "La IA sugiere skills requeridas y preguntas óptimas según el rol y sector." },
            { icon: BarChart3, title: "Métricas de calidad", desc: "Tiempo de contratación, retención a 90 días y calidad promedio del talento." },
            { icon: Users, title: "Modo institucional", desc: "Universidades y gobiernos rastrean empleabilidad de sus egresados con reportes agregados." },
          ].map((f) => (
            <div key={f.title} className="surface-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview CTA */}
      <section id="dashboard" className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-primary" />
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Un dashboard pensado para reclutadores</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Pool de talento, perfiles con video-entrevista, scoring transparente y publicación de vacantes en un solo lugar.
          </p>
          <Link
            to="/empresas/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Entrar al demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-tight">Planes B2B</h2>
          <p className="mt-3 text-muted-foreground">Empieza gratis. Escala cuando tu equipo lo necesite.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-xl border p-6 ${
                p.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/10 to-transparent shadow-[var(--shadow-glow)]"
                  : "border-border bg-surface"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Más elegido
                </span>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/empresas/dashboard"
                className={`mt-6 block rounded-full px-4 py-2.5 text-center text-sm font-medium transition ${
                  p.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:bg-surface-elevated"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <WiruLogo />
            <span className="text-xs">for Companies</span>
          </div>
          <p>© 2026 Wiru IA · Cusco, Perú</p>
        </div>
      </footer>
    </div>
  );
}
