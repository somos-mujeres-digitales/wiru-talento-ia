import { createFileRoute } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Lock, Download, Sparkles, UploadCloud, FileText, Loader2 } from "lucide-react";
import { MOCK_CV_SCORE, MOCK_TARGET, MOCK_USER } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/analysis")({
  component: Analysis,
});

function ScoreRing({ value }: { value: number }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v));
  const [, setTick] = useState(0);

  useEffect(() => {
    const ctrl = animate(count, value, { duration: 1.4, ease: "easeOut" });
    const unsub = display.on("change", () => setTick((t) => t + 1));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value, count, display]);

  const circ = 2 * Math.PI * 56;
  const dash = (display.get() / 100) * circ;

  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r="56" stroke="var(--color-border)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          stroke="url(#g)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.18 47)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 50)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-4xl font-semibold">{display}</motion.span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function Bar({ name, score, status }: { name: string; score: number; status: "good" | "warn" | "bad" }) {
  const color =
    status === "good" ? "var(--color-success)" : status === "warn" ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span>{name}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

type Stage = "idle" | "uploading" | "parsing" | "analyzing" | "done";

function Analysis() {
  const [improved, setImproved] = useState(MOCK_CV_SCORE.improvedSummary);
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startSimulation = (name: string) => {
    setFileName(name);
    setStage("uploading");
    setProgress(0);
    let p = 0;
    const up = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        clearInterval(up);
        setStage("parsing");
        setTimeout(() => setStage("analyzing"), 1100);
        setTimeout(() => setStage("done"), 2600);
      } else {
        setProgress(Math.round(p));
      }
    }, 220);
  };

  const onFile = (f?: File | null) => {
    if (!f) return;
    startSimulation(f.name);
  };

  if (stage !== "done") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="label-tag text-primary">Análisis de CV con IA</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Sube tu CV para analizarlo frente a {MOCK_TARGET.company}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aceptamos PDF o DOCX. Lo procesamos con IA y te damos un puntaje en segundos.
        </p>

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFile(e.dataTransfer.files?.[0]);
                }}
                className="surface-card flex cursor-pointer flex-col items-center justify-center p-10 text-center transition hover:border-primary"
                style={{ borderStyle: "dashed", borderWidth: 1.5 }}
              >
                <div className="rounded-full bg-primary/15 p-4 text-primary">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="mt-4 font-medium">Arrastra tu CV aquí o haz clic para seleccionar</p>
                <p className="mt-1 text-xs text-muted-foreground">PDF o DOCX · máximo 5 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  <UploadCloud className="h-4 w-4" /> Subir CV
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startSimulation(`CV_${MOCK_USER.fullName.replace(" ", "_")}.pdf`);
                  }}
                  className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  o probar con un CV de ejemplo
                </button>
              </div>
            </motion.div>
          )}

          {(stage === "uploading" || stage === "parsing" || stage === "analyzing") && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 surface-card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/15 p-2.5 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage === "uploading" && `Subiendo... ${progress}%`}
                    {stage === "parsing" && "Leyendo contenido del CV..."}
                    {stage === "analyzing" && `Analizando con IA frente a ${MOCK_TARGET.company}...`}
                  </p>
                </div>
                {stage !== "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{
                    width:
                      stage === "uploading" ? `${progress}%` : stage === "parsing" ? "70%" : "95%",
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              <ul className="mt-5 space-y-2 text-sm">
                {[
                  { k: "uploading", label: "Subir archivo" },
                  { k: "parsing", label: "Extraer texto del CV" },
                  { k: "analyzing", label: "Analizar con IA" },
                ].map((s, i) => {
                  const order = ["uploading", "parsing", "analyzing"];
                  const currentIdx = order.indexOf(stage);
                  const done = i < currentIdx;
                  const active = i === currentIdx;
                  return (
                    <li key={s.k} className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-border" />
                      )}
                      <span className={done || active ? "" : "text-muted-foreground"}>{s.label}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="label-tag text-primary">Análisis de CV</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        Tu puntaje para {MOCK_TARGET.company}
      </h1>

      {/* Score & banner */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[auto,1fr]">
        <div className="surface-card flex flex-col items-center justify-center p-6">
          <ScoreRing value={MOCK_CV_SCORE.total} />
          <p className="mt-3 text-sm text-muted-foreground">Puntaje de perfil</p>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-warning/15 p-2 text-warning">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Tu CV tiene potencial, pero necesita ajustes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Los reclutadores de {MOCK_TARGET.company} revisan decenas de CVs. Con los ajustes
                correctos, el tuyo puede destacar.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary">
                  Nivel potencial
                </span>
                <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs text-warning">
                  3 mejoras sugeridas
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {MOCK_CV_SCORE.categories.map((c) => (
              <Bar key={c.name} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <h2 className="mt-10 text-lg font-medium">Recomendaciones para {MOCK_TARGET.company}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {MOCK_CV_SCORE.recommendations.map((r, i) => {
          const isWarn = r.type === "warning";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card p-5"
            >
              <div
                className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  isWarn ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                }`}
              >
                {isWarn ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </div>
              <p className="font-medium">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Improved text */}
      <div className="mt-10 surface-card p-6">
        <div className="flex items-center justify-between">
          <p className="label-tag text-primary">Texto mejorado · copia gratis</p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(improved);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface-elevated transition"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "¡Copiado!" : "Copiar texto"}
          </button>
        </div>
        <textarea
          value={improved}
          onChange={(e) => setImproved(e.target.value)}
          rows={5}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none ring-primary/30 transition focus:border-primary focus:ring-4"
        />
      </div>

      {/* Download formats */}
      <div className="mt-10">
        <h2 className="text-lg font-medium">Descarga tu CV listo para enviar</h2>
        <p className="text-sm text-muted-foreground">Disponible en distintos formatos según el destino.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { name: "Cronológico", desc: "Para empleos en Cusco", free: true, badge: "Recomendado" },
            { name: "Harvard", desc: "En inglés para empresas internacionales", free: false },
            { name: "Europass", desc: "Para empresas europeas", free: false },
          ].map((f) => (
            <div key={f.name} className="surface-card flex flex-col p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{f.name}</p>
                {f.badge && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    {f.badge}
                  </span>
                )}
                {!f.free && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              <button
                disabled={!f.free}
                className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  f.free
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background text-muted-foreground"
                }`}
              >
                <Download className="h-4 w-4" />
                {f.free ? "Descargar" : "Pro"}
              </button>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          Activar Pro — todos los formatos · S/ 14.90 →
        </button>
      </div>
    </div>
  );
}
