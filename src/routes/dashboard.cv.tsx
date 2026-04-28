import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { MOCK_USER } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard/cv")({
  component: CvBuilder,
});

function CvBuilder() {
  const [summary, setSummary] = useState(
    "Egresada de Administración con interés en el sector financiero y la atención al cliente.",
  );
  const [skills, setSkills] = useState<string[]>(["Excel", "Atención al cliente", "Trabajo en equipo"]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="label-tag text-primary">Crea tu CV</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Tu CV paso a paso</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Llena los campos y deja que la IA pulir el texto por ti.
      </p>

      <Section title="Datos personales">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nombre completo" defaultValue={MOCK_USER.fullName} />
          <Input label="Correo" defaultValue={MOCK_USER.email} />
          <Input label="Teléfono" placeholder="+51 9XX XXX XXX" />
          <Input label="LinkedIn" placeholder="linkedin.com/in/tu-usuario" />
          <Input label="Ciudad" defaultValue={MOCK_USER.location} />
        </div>
      </Section>

      <Section title="Resumen profesional" aiBtn>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
        />
      </Section>

      <Section title="Experiencia laboral" aiBtn>
        <ExperienceItem />
        <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition">
          <Plus className="h-3.5 w-3.5" /> Agregar experiencia
        </button>
      </Section>

      <Section title="Educación">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Carrera" defaultValue={MOCK_USER.career} />
          <Input label="Institución" placeholder="Universidad Andina del Cusco" />
          <Input label="Año de inicio" placeholder="2020" />
          <Input label="Año de fin" placeholder="2024" />
        </div>
      </Section>

      <Section title="Habilidades">
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
            >
              {s}
              <button
                onClick={() => setSkills(skills.filter((x) => x !== s))}
                className="text-text-muted hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Nueva habilidad..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={addSkill}
            className="rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Agregar
          </button>
        </div>
      </Section>

      <Section title="Idiomas">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Idioma" defaultValue="Español — Nativo" />
          <Input label="Idioma" placeholder="Inglés — Intermedio" />
        </div>
      </Section>

      <div className="mt-8 flex justify-end gap-3">
        <button className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-elevated transition">
          Guardar borrador
        </button>
        <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          Generar CV
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  aiBtn,
}: {
  title: string;
  children: React.ReactNode;
  aiBtn?: boolean;
}) {
  return (
    <section className="mt-6 surface-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">{title}</h2>
        {aiBtn && (
          <button className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/15 transition">
            <Sparkles className="h-3.5 w-3.5" /> Mejorar con IA
          </button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label-tag text-text-muted">{label}</label>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function ExperienceItem() {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Cargo" placeholder="Asistente de ventas" />
        <Input label="Empresa" placeholder="Tienda XYZ" />
        <Input label="Desde" placeholder="Ene 2023" />
        <Input label="Hasta" placeholder="Actualidad" />
      </div>
      <div className="mt-3">
        <label className="label-tag text-text-muted">Logros</label>
        <textarea
          rows={3}
          placeholder="Atendí 200+ clientes diarios manteniendo 95% de satisfacción..."
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <button className="mt-2 inline-flex items-center gap-1 text-xs text-text-muted hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" /> Eliminar
      </button>
    </div>
  );
}
