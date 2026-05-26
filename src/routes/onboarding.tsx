import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSessionState, clearSessionUser } from "@/lib/session";
import { ArrowRight, ArrowLeft, Check, Mail } from "lucide-react";
import { WiruLogo } from "@/components/WiruLogo";
import { SECTORS, STAGES } from "@/lib/mockData";
import { useDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { runAutomationSequence } = useDemoMode();
  const [step, setStep] = useState(1);
  const [name, setName] = useSessionState<string>("wiru_name", "");
  const [sectors, setSectors] = useSessionState<string[]>("wiru_sectors", []);
  const [stage, setStage] = useSessionState<string | null>("wiru_stage", null);
  const [email, setEmail] = useSessionState<string>("wiru_email", "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Ingresa un correo válido (ej: tu.nombre@gmail.com)";
    }
    if (password.length < 6) {
      e.password = "Mínimo 6 caracteres";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finish = (provider: "google" | "email") => {
    if (provider === "email" && !validate()) return;
    runAutomationSequence(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "wiru_user",
          JSON.stringify({
            name: name || "María Fernanda",
            sectors,
            stage,
            email:
              provider === "google"
                ? `${(name || "usuario").toLowerCase().replace(/\s+/g, ".")}@gmail.com`
                : email.trim(),
            provider,
          }),
        );
        // clear temporary session values after account creation
        clearSessionUser();
      }
      navigate({ to: "/dashboard" });
    });
  };

  const canContinue =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && sectors.length > 0) ||
    (step === 3 && stage !== null) ||
    step === 4;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar with progress */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/">
            <WiruLogo />
          </Link>
          <span className="text-xs text-muted-foreground">Paso {step} de 4</span>
        </div>
        <div className="h-1 w-full bg-border">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-3xl flex-col px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {step === 1 && (
              <div className="mx-auto max-w-xl pt-12 text-center">
                <h1 className="text-4xl font-semibold tracking-tight">¡Hola! ¿Cómo te llamas?</h1>
                <p className="mt-3 text-muted-foreground">Solo tu primer nombre está bien.</p>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-10 w-full rounded-2xl border border-border bg-surface px-6 py-5 text-center text-2xl font-medium outline-none ring-primary/40 transition focus:border-primary focus:ring-4"
                />
                <AnimatePresence>
                  {name.trim() && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 text-lg text-muted-foreground"
                    >
                      Hola, <span className="text-foreground font-medium">{name}</span> 👋
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  ¿Qué tipo de trabajo buscas, {name || "amigo"}?
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Puedes elegir más de uno. Esto nos ayuda a personalizar tus vacantes.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {SECTORS.map((s) => {
                    const active = sectors.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() =>
                          setSectors((prev) =>
                            active ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                          )
                        }
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-surface hover:bg-surface-elevated"
                        }`}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                        </div>
                        {active && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">¿En qué etapa estás?</h1>
                <p className="mt-2 text-muted-foreground">Elige la que mejor te describa hoy.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {STAGES.map((s) => {
                    const active = stage === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStage(s.id)}
                        className={`relative rounded-xl border p-5 text-left transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-surface hover:bg-surface-elevated"
                        }`}
                      >
                        <p className="font-medium">{s.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{s.subtitle}</p>
                        {active && (
                          <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                  Tu perfil está listo, {name || "amigo"}.
                </h1>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {sectors.map((id) => {
                    const s = SECTORS.find((x) => x.id === id)!;
                    return (
                      <span
                        key={id}
                        className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {s.icon} {s.title}
                      </span>
                    );
                  })}
                  {stage && (
                    <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                      {STAGES.find((s) => s.id === stage)?.title}
                    </span>
                  )}
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Crea tu cuenta para guardar tu progreso.
                </p>
                <form
                  className="mt-6 space-y-3 text-left"
                  onSubmit={(e) => {
                    e.preventDefault();
                    finish("email");
                  }}
                >
                  <div>
                    <label className="label-tag text-text-muted">Correo</label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="tu.nombre@gmail.com"
                      className={`mt-2 w-full rounded-xl border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary ${
                        errors.email ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="label-tag text-text-muted">Contraseña</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      placeholder="Mínimo 6 caracteres"
                      className={`mt-2 w-full rounded-xl border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary ${
                        errors.password ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                  >
                    <Mail className="h-4 w-4" />
                    Crear cuenta
                  </button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-3 text-xs text-muted-foreground">o</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => finish("google")}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm hover:bg-surface-elevated transition"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                      />
                    </svg>
                    Continuar con Google
                  </button>
                </form>
                <p className="mt-4 text-xs text-text-muted">
                  Al crear tu cuenta aceptas los términos de uso.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={back}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
            <button
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
