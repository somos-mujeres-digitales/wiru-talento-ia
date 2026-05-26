import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileText,
  BarChart3,
  Mic,
  ListChecks,
  Check,
  Sparkles,
  Volume2,
  Brain,
  Building2,
  MessageSquare,
  Gauge,
  Radio,
} from "lucide-react";
import { WiruLogo } from "@/components/WiruLogo";
import { DemoUpgradeButton, ProBadge, ResetDemoButton } from "@/components/demo-mode";
import { useDemoMode } from "@/lib/demo-mode";

const COMPANY_LOGOS = [
  { src: new URL("../public/bcp.png", import.meta.url).href, alt: "BCP" },
  { src: new URL("../public/bbva.png", import.meta.url).href, alt: "BBVA" },
  { src: new URL("../public/caja cusco.png", import.meta.url).href, alt: "Caja Cusco" },
  { src: new URL("../public/casa andina.png", import.meta.url).href, alt: "Casa Andina" },
  { src: new URL("../public/latam.png", import.meta.url).href, alt: "LATAM" },
  { src: new URL("../public/sodimac.png", import.meta.url).href, alt: "Sodimac" },
  { src: new URL("../public/marriot.png", import.meta.url).href, alt: "Marriott" },
  { src: new URL("../public/levely.png", import.meta.url).href, alt: "Levely" },
];

const MARQUEE_LOGOS = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wiru IA — Consigue tu primer empleo en Cusco" },
      {
        name: "description",
        content:
          "Wiru IA analiza tu CV, te prepara para la entrevista y hace seguimiento de tus postulaciones — todo en un solo lugar.",
      },
      { property: "og:title", content: "Wiru IA — Tu primer empleo en Cusco" },
      {
        property: "og:description",
        content: "Análisis de CV con IA, simulación de entrevistas y tracker de postulaciones.",
      },
    ],
  }),
  component: Landing,
});

const ROTATING_WORDS = ["empleo", "oportunidad", "carrera", "futuro"];

function Landing() {
  const [wordIdx, setWordIdx] = useState(0);
  const { isPro } = useDemoMode();

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING_WORDS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <WiruLogo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground transition">
              Cómo funciona
            </a>
            <a href="#entrevistas-ia" className="hover:text-foreground transition">
              Entrevistas IA
            </a>
            <a href="#planes" className="hover:text-foreground transition">
              Planes
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isPro ? (
              <ProBadge className="hidden sm:inline-flex" />
            ) : (
              <DemoUpgradeButton className="hidden sm:inline-flex" label="Pasar a Pro" />
            )}
            <Link
              to="/onboarding"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            IA entrenada para empleos en Cusco
          </motion.div>

          <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Consigue tu primer{" "}
            <span className="relative inline-block align-baseline">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIdx]}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                  className="inline-block gradient-text"
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            en Cusco.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Wiru IA analiza tu CV, te prepara para la entrevista y hace seguimiento de tus
            postulaciones — todo en un solo lugar.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 glow-primary"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Social proof */}
        <div id="empresas" className="mx-auto max-w-6xl px-6 pb-20">
          <p className="text-center text-xs uppercase tracking-[0.16em] text-text-muted">
            Empresas en Cusco que buscan tu perfil
          </p>
          <div
            className="mt-8 overflow-hidden"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              borderRadius: "0.5rem",
              paddingInline: "0.5rem",
              maskImage: "linear-gradient(to right, transparent, black 8%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 95%, transparent)",
            }}
          >
            <div className="marquee-track flex w-max items-center gap-10 py-2">
              {MARQUEE_LOGOS.map((company, index) => (
                <div
                  key={`${company.alt}-${index}`}
                  className="flex h-28 w-52 flex-none items-center justify-center sm:h-32 sm:w-60 md:h-36 md:w-64"
                >
                  <img
                    src={company.src}
                    alt={company.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="label-tag text-primary">Cómo funciona</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Cuatro pasos hasta tu próximo empleo
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, title: "Sube tu CV", desc: "Lo analizamos en segundos" },
            {
              icon: BarChart3,
              title: "Tu score de empleo",
              desc: "Sabés qué mejorar antes de postular",
            },
            {
              icon: Mic,
              title: "Simula tu entrevista",
              desc: "Practica con IA antes del día real",
            },
            {
              icon: ListChecks,
              title: "Haz seguimiento",
              desc: "Nunca pierdas el hilo de tus postulaciones",
            },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="surface-card p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="label-tag text-text-muted">Paso {i + 1}</p>
              <h3 className="mt-1 text-lg font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Interview — Diferencial clave */}
      <section id="entrevistas-ia" className="relative overflow-hidden border-y border-border/60">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Radio className="h-3.5 w-3.5" />
                Lo que nos hace diferentes
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
                Entrevistas con IA <span className="gradient-text">en tiempo real</span>, por voz.
              </h2>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                No es otro CV builder. Wiru IA te entrena con un entrevistador virtual que te
                escucha, te responde y se adapta al sector al que postulas — como una entrevista
                real, las veces que quieras.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: Volume2,
                    title: "Conversación por voz natural",
                    desc: "La IA te hace la pregunta en voz alta y transcribe tu respuesta mientras hablas.",
                  },
                  {
                    icon: Brain,
                    title: "Preguntas que se adaptan a ti",
                    desc: "El motor conversacional ajusta la siguiente pregunta según lo que respondiste.",
                  },
                  {
                    icon: Building2,
                    title: "Escenarios por sector",
                    desc: "Finanzas, sector público, comercio, hotelería — entrenas con preguntas reales del rubro.",
                  },
                  {
                    icon: Gauge,
                    title: "Retroalimentación automática",
                    desc: "Recibes un puntaje por claridad, conocimiento y confianza, con consejos para mejorar.",
                  },
                ].map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <f.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 glow-primary"
                >
                  Probar entrevista con IA
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#diferencial"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-6 py-3 text-sm font-medium hover:bg-surface transition"
                >
                  Ver el diferencial
                </a>
              </div>
            </div>

            {/* Right: live mock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div
                className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--primary) 6%, var(--surface)) 0%, var(--surface) 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <motion.span
                        className="absolute inline-flex h-full w-full rounded-full bg-success"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">Entrevista en vivo</span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    Sector financiero
                  </span>
                </div>

                {/* Agent question */}
                <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-medium text-primary">Entrevistador IA</p>
                    <div className="ml-auto flex items-center gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="block w-0.5 rounded-full bg-primary"
                          animate={{ height: ["4px", "14px", "4px"] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">
                    "Cuéntame una experiencia de liderazgo: ¿cómo la resolviste primero como
                    integrante del equipo y luego como líder?"
                  </p>
                </div>

                {/* User reply */}
                <div className="mt-3 ml-8 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success">
                      <Mic className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-medium text-success">Tú · transcribiendo</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    "En mi último proyecto de la universidad organicé al equipo para entregar a
                    tiempo
                    <motion.span
                      className="ml-0.5 inline-block w-1.5 h-3.5 align-middle bg-primary"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  </p>
                </div>

                {/* Live feedback strip */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Claridad", v: 88 },
                    { label: "Confianza", v: 76 },
                    { label: "Estructura", v: 82 },
                  ].map((m, i) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-border bg-surface/60 p-2.5"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-text-muted">
                        {m.label}
                      </p>
                      <p className="mt-0.5 text-lg font-semibold">{m.v}%</p>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.v}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating sector tags */}
              <motion.div
                className="absolute -left-3 -top-3 hidden rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] text-muted-foreground shadow-lg backdrop-blur sm:block"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                🏛️ Sector público
              </motion.div>
              <motion.div
                className="absolute -right-3 bottom-12 hidden rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] text-muted-foreground shadow-lg backdrop-blur sm:block"
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                🏪 Comercio
              </motion.div>
            </motion.div>
          </div>

          {/* Diferencial bar */}
          <div id="diferencial" className="mt-20 grid gap-4 md:grid-cols-4">
            {[
              {
                t: "Entrenamiento + evaluación + empleo",
                d: "Una sola plataforma, sin saltar entre apps.",
              },
              {
                t: "Entrevistas con IA en tiempo real",
                d: "Voz natural, preguntas que reaccionan.",
              },
              { t: "Adaptado a tu sector", d: "Finanzas, público, comercio y más." },
              {
                t: "No solo el CV — tu desempeño",
                d: "Demuestras lo que sabes, no solo lo que dice tu papel.",
              },
            ].map((d) => (
              <div key={d.t} className="surface-card p-5">
                <Check className="h-4 w-4 text-primary" />
                <p className="mt-3 font-medium leading-snug">{d.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="label-tag text-primary">Planes</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Empieza gratis. Sube a Pro cuando quieras.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-card p-8">
            <p className="label-tag text-text-muted">Gratis</p>
            <p className="mt-2 text-3xl font-semibold">S/ 0</p>
            <p className="mt-1 text-sm text-muted-foreground">Para empezar y descubrir tu perfil</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Score de CV", "3 vacantes visibles", "Tracker básico"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/onboarding"
              className="mt-8 block w-full rounded-full border border-border bg-surface py-2.5 text-center text-sm font-medium hover:bg-surface-elevated transition"
            >
              Empezar gratis
            </Link>
          </div>

          <div
            className="relative rounded-xl p-8"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--primary) 14%, var(--surface)) 0%, var(--surface) 100%)",
              border: "1px solid color-mix(in oklab, var(--primary) 40%, var(--border))",
            }}
          >
            <span className="absolute -top-3 left-8 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Más popular
            </span>
            <p className="label-tag text-primary">Pro</p>
            <p className="mt-2 text-3xl font-semibold">
              S/ 14.90 <span className="text-base font-normal text-muted-foreground">/mes</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Todo lo que necesitas para destacar
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Score completo + recomendaciones",
                "Simulación de entrevistas ilimitada",
                "Tracker completo + alertas",
                "Acceso a todas las vacantes",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {isPro ? (
                <ProBadge className="w-full justify-center" />
              ) : (
                <DemoUpgradeButton className="w-full justify-center" label="Activar Pro" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <WiruLogo />
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Wiru IA · Hecho en Cusco para Cusco.
          </p>
          <ResetDemoButton />
        </div>
      </footer>
    </div>
  );
}
