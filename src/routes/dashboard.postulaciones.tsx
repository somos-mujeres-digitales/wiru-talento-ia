import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Mic, X } from "lucide-react";
import { MOCK_APPLICATIONS, type ApplicationStatus } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/postulaciones")({
  component: Tracker,
});

const COLUMNS: { key: ApplicationStatus; label: string; tone: string }[] = [
  { key: "applied", label: "Aplicado", tone: "border-border" },
  { key: "review", label: "En revisión", tone: "border-chart-3/40" },
  { key: "interview", label: "Entrevista", tone: "border-primary/40" },
  { key: "offer", label: "Oferta", tone: "border-success/40" },
  { key: "rejected", label: "Descartado", tone: "border-destructive/40" },
];

function Tracker() {
  const [items, setItems] = useState(MOCK_APPLICATIONS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ company: "", role: "", status: "applied" as ApplicationStatus });

  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData("id", id);
  const onDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    const id = e.dataTransfer.getData("id");
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  const add = () => {
    if (!draft.company.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        company: draft.company,
        role: draft.role || "Sin título",
        status: draft.status,
        appliedAgo: "hoy",
        nextAction: "Recién agregada",
        match: 50,
        initials: draft.company.slice(0, 2).toUpperCase(),
        color: "oklch(0.65 0.16 230)",
      },
    ]);
    setDraft({ company: "", role: "", status: "applied" });
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mis postulaciones</h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              {items.length} totales
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Haz seguimiento de cada oportunidad que estás persiguiendo.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15 transition"
        >
          <Plus className="h-4 w-4" /> Agregar postulación
        </button>
      </div>

      {/* Kanban */}
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const cards = items.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
              className={`rounded-xl border-t-2 ${col.tone} bg-surface/60 p-3`}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <p className="text-sm font-medium">{col.label}</p>
                <span className="text-xs text-muted-foreground">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <motion.div
                    layout
                    key={c.id}
                    draggable
                    onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, c.id)}
                    className="cursor-grab active:cursor-grabbing rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background"
                        style={{ background: c.color }}
                      >
                        {c.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.role}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.company}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {c.match}%
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-text-muted">{c.appliedAgo}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] text-muted-foreground">
                        {c.nextAction}
                      </span>
                      <button className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] hover:border-primary/40 hover:text-primary transition">
                        <Mic className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {cards.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-text-muted">
                    Suelta aquí
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Nueva postulación</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Empresa"
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <input
                placeholder="Puesto"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as ApplicationStatus })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <button
                onClick={add}
                className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
