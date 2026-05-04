import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Building2, Bell, Plus, Users, Briefcase, BarChart3,
  Settings, Home, ChevronRight, Star, Play, X, Mail, Sparkles, TrendingUp,
  Clock, Target, Award, Mic, FileText, ThumbsUp, AlertCircle, Zap,
} from "lucide-react";
import { WiruLogo } from "@/components/WiruLogo";
import {
  COMPANY_CANDIDATES, COMPANY_VACANCIES, COMPANY_METRICS, SUGGESTED_SKILLS_BY_ROLE,
  type CompanyCandidate,
} from "@/lib/companyMockData";

export const Route = createFileRoute("/empresas/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Wiru IA for Companies" }] }),
  component: CompanyDashboard,
});

type View = "overview" | "candidates" | "vacancies" | "metrics" | "publish";

const SECTORS = ["Todos", "Finanzas", "Hotelería", "Retail", "Salud", "Sector público", "Tecnología"];
const RECOM_LABELS: Record<string, { label: string; color: string }> = {
  "alto-potencial": { label: "Alto potencial", color: "var(--success)" },
  "apto": { label: "Apto", color: "var(--primary)" },
  "en-desarrollo": { label: "En desarrollo", color: "var(--warning)" },
};

function CompanyDashboard() {
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<CompanyCandidate | null>(null);
  const [sector, setSector] = useState("Todos");
  const [minScore, setMinScore] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return COMPANY_CANDIDATES.filter((c) => {
      if (sector !== "Todos" && c.sector !== sector) return false;
      if (c.score.total < minScore) return false;
      if (query && !`${c.name} ${c.role} ${c.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.match - a.match);
  }, [sector, minScore, query]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="px-5 py-5">
          <Link to="/empresas" className="flex items-center gap-2">
            <WiruLogo />
          </Link>
          <span className="mt-2 inline-flex rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
            for Companies
          </span>
        </div>

        <div className="px-5 pb-4">
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Empresa</p>
            <p className="text-sm font-medium">Caja Cusco S.A.</p>
            <p className="text-xs text-muted-foreground">Plan Pro</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {([
            ["overview", Home, "Resumen"],
            ["candidates", Users, "Pool de talento"],
            ["vacancies", Briefcase, "Vacantes"],
            ["publish", Plus, "Nueva vacante IA"],
            ["metrics", BarChart3, "Métricas"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                view === key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Settings className="h-3.5 w-3.5" /> Configuración
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        {/* Topbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Caja Cusco</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground capitalize">{viewTitle(view)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary md:flex">
              <Bell className="h-3.5 w-3.5" /> 2 candidatos ideales nuevos
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-semibold">RH</div>
          </div>
        </div>

        <div className="px-6 py-6">
          {view === "overview" && <Overview onOpen={setSelected} go={setView} />}
          {view === "candidates" && (
            <CandidatesView
              filtered={filtered}
              sector={sector} setSector={setSector}
              minScore={minScore} setMinScore={setMinScore}
              query={query} setQuery={setQuery}
              onOpen={setSelected}
            />
          )}
          {view === "vacancies" && <VacanciesView />}
          {view === "publish" && <PublishView />}
          {view === "metrics" && <MetricsView />}
        </div>
      </main>

      {/* Drawer perfil */}
      <AnimatePresence>
        {selected && <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function viewTitle(v: View) {
  return { overview: "Resumen", candidates: "Pool de talento", vacancies: "Vacantes", publish: "Nueva vacante IA", metrics: "Métricas" }[v];
}

/* ---------- Overview ---------- */
function Overview({ onOpen, go }: { onOpen: (c: CompanyCandidate) => void; go: (v: View) => void }) {
  const top = COMPANY_CANDIDATES.slice(0, 5);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buenos días, María 👋</h1>
        <p className="text-sm text-muted-foreground">Tienes 5 candidatos rankeados por IA listos para revisar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(COMPANY_METRICS).map(([k, m]) => (
          <div key={k} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{m.value}</span>
              <span className="text-xs text-success">{m.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Top 5 candidatos · Ejecutiva de Atención</h2>
              <p className="text-xs text-muted-foreground">Rankeados por IA · aprende de tus decisiones</p>
            </div>
            <button onClick={() => go("candidates")} className="text-xs text-primary hover:underline">Ver todos →</button>
          </div>
          <div className="space-y-2">
            {top.map((c, i) => (
              <button
                key={c.id}
                onClick={() => onOpen(c)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-elevated/40 p-3 text-left transition hover:border-primary/50"
              >
                <span className="w-5 text-center text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold" style={{ background: c.color, color: "var(--background)" }}>
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.role} · {c.sector}</p>
                </div>
                <RecomBadge rec={c.recommendation} />
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold text-primary">{c.match}%</p>
                  <p className="text-[10px] uppercase text-muted-foreground">match</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Bell className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Alertas IA</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">Nuevo candidato ideal</p>
                <p className="mt-1 text-muted-foreground">María Quispe — 94% match con tu vacante de Atención al Cliente.</p>
              </li>
              <li className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold">Vacante poco visible</p>
                <p className="mt-1 text-muted-foreground">"Analista Junior" lleva 2 días sin matches. La IA sugiere ampliar skills.</p>
              </li>
            </ul>
          </div>
          <button onClick={() => go("publish")} className="surface-card flex w-full items-center gap-3 p-5 text-left transition hover:border-primary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Plus className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">Publicar vacante con IA</p>
              <p className="text-xs text-muted-foreground">Sugerencia automática de skills y preguntas</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Candidates ---------- */
function CandidatesView({
  filtered, sector, setSector, minScore, setMinScore, query, setQuery, onOpen,
}: {
  filtered: CompanyCandidate[];
  sector: string; setSector: (s: string) => void;
  minScore: number; setMinScore: (n: number) => void;
  query: string; setQuery: (s: string) => void;
  onOpen: (c: CompanyCandidate) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pool de talento</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} candidatos evaluados por IA</p>
      </div>

      <div className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, rol o skill…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Score mínimo</span>
            <input type="range" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 accent-[var(--primary)]" />
            <span className="w-8 text-right text-xs font-semibold">{minScore}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpen(c)}
            className="surface-card flex flex-col gap-3 p-4 text-left transition hover:border-primary/50 md:flex-row md:items-center"
          >
            <div className="flex items-center gap-3 md:w-72">
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold" style={{ background: c.color, color: "var(--background)" }}>
                {c.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:flex-1">
              {c.skills.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-muted-foreground">{s}</span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <RecomBadge rec={c.recommendation} />
              <ScoreRing value={c.score.total} />
              <div className="text-right">
                <p className="text-base font-semibold text-primary">{c.match}%</p>
                <p className="text-[10px] uppercase text-muted-foreground">match</p>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            No hay candidatos con esos filtros. Prueba ampliar el sector o bajar el score mínimo.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Vacancies ---------- */
function VacanciesView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vacantes</h1>
          <p className="text-sm text-muted-foreground">Cada vacante tiene un top automático generado por IA</p>
        </div>
      </div>
      <div className="grid gap-3">
        {COMPANY_VACANCIES.map((v) => (
          <div key={v.id} className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{v.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${v.status === "Activa" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {v.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{v.sector} · publicada hace {v.days}d</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold">{v.candidates}</p>
                <p className="text-[10px] uppercase text-muted-foreground">candidatos</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">Top {v.top}</p>
                <p className="text-[10px] uppercase text-muted-foreground">IA ranking</p>
              </div>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated">Ver candidatos</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Publish ---------- */
function PublishView() {
  const [title, setTitle] = useState("Ejecutiva de Atención al Cliente");
  const [sector, setSector] = useState("Finanzas");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const sug = SUGGESTED_SKILLS_BY_ROLE.default;

  const generate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1100);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Vacante inteligente
        </h1>
        <p className="text-sm text-muted-foreground">La IA sugiere skills, preguntas y matchea candidatos automáticamente.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card space-y-4 p-5">
          <div>
            <label className="text-xs uppercase text-muted-foreground">Título del puesto</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Sector</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {SECTORS.filter((s) => s !== "Todos").map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Descripción</label>
            <textarea rows={4} placeholder="Describe el rol…" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <button onClick={generate} disabled={loading} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Generando con IA…" : generated ? "Regenerar sugerencias" : "Generar con IA"}
          </button>
        </div>

        <div className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Zap className="h-4 w-4 text-primary" /> Sugerencias IA</h3>
          {!generated ? (
            <p className="mt-4 text-sm text-muted-foreground">Genera la vacante para ver skills sugeridas y preguntas óptimas.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Skills recomendadas</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sug.skills.map((s) => <span key={s} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary">{s}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Preguntas de entrevista</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {sug.questions.map((q, i) => (
                    <li key={q} className="rounded-lg border border-border bg-surface-elevated/50 p-2.5">
                      <span className="text-xs font-semibold text-primary">P{i + 1}.</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs">
                <Target className="mb-1 h-4 w-4 text-success" />
                <p><span className="font-semibold text-success">12 candidatos</span> ya evaluados hacen match con esta vacante. Pueden recibir invitación al publicar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Metrics ---------- */
function MetricsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">Calidad, velocidad y eficiencia de tu reclutamiento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Clock, ...COMPANY_METRICS.timeToHire },
          { icon: Award, ...COMPANY_METRICS.qualityScore },
          { icon: Target, ...COMPANY_METRICS.matchRate },
          { icon: TrendingUp, ...COMPANY_METRICS.retention },
        ].map((m) => (
          <div key={m.label} className="surface-card p-4">
            <m.icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-2xl font-semibold">{m.value}</p>
            <p className="text-xs text-success">{m.delta} vs trimestre anterior</p>
          </div>
        ))}
      </div>

      <div className="surface-card p-5">
        <h3 className="text-sm font-semibold">Funnel de contratación (últimos 30 días)</h3>
        <div className="mt-5 space-y-3">
          {[
            { stage: "Candidatos en pool", value: 142, w: 100 },
            { stage: "Match IA > 70%", value: 68, w: 70 },
            { stage: "Perfil revisado", value: 41, w: 50 },
            { stage: "Invitados a entrevista real", value: 18, w: 30 },
            { stage: "Contratados", value: 7, w: 14 },
          ].map((s) => (
            <div key={s.stage}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{s.stage}</span>
                <span className="font-semibold">{s.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.w}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--primary-glow)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Modo institucional</h3>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Enterprise</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Para universidades y gobiernos: tracking de empleabilidad agregado de cohortes completas.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Stat label="Egresados activos" value="1,284" />
          <Stat label="Tasa de empleabilidad" value="64%" />
          <Stat label="Tiempo promedio al primer empleo" value="3.2 meses" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

/* ---------- Shared ---------- */
function RecomBadge({ rec }: { rec: CompanyCandidate["recommendation"] }) {
  const r = RECOM_LABELS[rec];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `color-mix(in oklab, ${r.color} 15%, transparent)`, color: r.color }}>
      <Star className="h-2.5 w-2.5" /> {r.label}
    </span>
  );
}

function ScoreRing({ value }: { value: number }) {
  const radius = 18; const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative h-12 w-12">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="var(--surface-elevated)" strokeWidth="4" fill="none" />
        <circle cx="24" cy="24" r={radius} stroke="var(--primary)" strokeWidth="4" fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{value}</span>
    </div>
  );
}

/* ---------- Drawer ---------- */
function CandidateDrawer({ candidate, onClose }: { candidate: CompanyCandidate; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [activeQ, setActiveQ] = useState(0);
  const c = candidate;

  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background shadow-2xl"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28 }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold" style={{ background: c.color, color: "var(--background)" }}>{c.initials}</div>
            <div>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.role} · {c.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-surface"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-6 p-6">
          {/* Score header */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Score general IA</p>
                <p className="mt-1 text-4xl font-semibold gradient-text">{c.score.total}<span className="text-lg text-muted-foreground">/100</span></p>
                <RecomBadge rec={c.recommendation} />
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Match con vacante</p>
                <p className="mt-1 text-3xl font-semibold text-primary">{c.match}%</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                ["Claridad", c.score.claridad],
                ["Confianza", c.score.confianza],
                ["Estructura", c.score.estructura],
                ["Técnico", c.score.tecnico],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-semibold">{v}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-elevated">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video / interview preview */}
          <div className="surface-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-surface-elevated via-surface to-background">
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={() => setPlaying(!playing)} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105">
                  <Play className="h-7 w-7 fill-current" />
                </button>
              </div>
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-[10px] backdrop-blur">
                <Mic className="h-3 w-3 text-primary" /> Simulación IA · {c.interview.duration}
              </div>
              {playing && (
                <div className="absolute bottom-3 left-3 right-3 flex items-end gap-1">
                  {[20, 35, 60, 45, 80, 55, 30, 50, 70, 40].map((h, i) => (
                    <motion.div key={i} animate={{ height: [`${h}%`, `${h * 0.5}%`, `${h}%`] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }} className="w-1.5 rounded-full bg-primary/70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {c.interview.questions.map((_, i) => (
                  <button key={i} onClick={() => setActiveQ(i)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${activeQ === i ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                    Pregunta {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border bg-surface-elevated/40 p-3">
                <p className="text-xs font-semibold text-primary">{c.interview.questions[activeQ].q}</p>
                <p className="mt-2 text-sm text-muted-foreground">"{c.interview.questions[activeQ].transcript}"</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">Respuesta · {c.interview.questions[activeQ].score}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* CV summary */}
          <div className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> CV analizado</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.cvSummary}</p>
            <div className="mt-3">
              <p className="text-[10px] uppercase text-muted-foreground">Habilidades técnicas</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{c.skills.map((s) => <span key={s} className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs">{s}</span>)}</div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] uppercase text-muted-foreground">Habilidades blandas</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{c.softSkills.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>)}</div>
            </div>
          </div>

          {/* Recomendación IA */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-card p-4">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-success"><ThumbsUp className="h-3.5 w-3.5" /> Fortalezas</h4>
              <ul className="mt-2 space-y-1.5 text-sm">{c.strengths.map((s) => <li key={s} className="flex gap-2"><span className="text-success">·</span>{s}</li>)}</ul>
            </div>
            <div className="surface-card p-4">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-warning"><AlertCircle className="h-3.5 w-3.5" /> A desarrollar</h4>
              <ul className="mt-2 space-y-1.5 text-sm">{c.weaknesses.map((s) => <li key={s} className="flex gap-2"><span className="text-warning">·</span>{s}</li>)}</ul>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <Mail className="h-4 w-4" /> Invitar a entrevista real
            </button>
            <button className="rounded-full border border-border px-4 py-2.5 text-sm hover:bg-surface">Guardar</button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
