import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CreditCard, Loader2, RefreshCcw, Sparkles, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_PAYMENT,
  DemoModeContext,
  PaymentFormState,
  clearDemoStorage,
  setStoredPro,
  sleep,
  useDemoMode,
  useProSnapshot,
} from "@/lib/demo-mode";

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const isPro = useProSnapshot();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const openPaymentModal = useCallback(() => setPaymentOpen(true), []);
  const closePaymentModal = useCallback(() => {
    if (!isProcessingPayment) setPaymentOpen(false);
  }, [isProcessingPayment]);

  const resetDemo = useCallback(() => {
    clearDemoStorage();
    setPaymentOpen(false);
    window.location.reload();
  }, []);

  const runAutomationSequence = useCallback((onComplete?: () => void) => {
    toast("💾 Cambios guardados con éxito en la base de datos.");
    window.setTimeout(() => {
      toast("📧 Correo de confirmación enviado automáticamente al candidato.");
    }, 1500);
    window.setTimeout(() => {
      toast("🤖 Automatización completada: Datos sincronizados con tu CRM.");
      onComplete?.();
    }, 3000);
  }, []);

  const activatePro = useCallback(async (_payload: PaymentFormState) => {
    setIsProcessingPayment(true);
    try {
      await sleep(2500);
      setStoredPro(true);
      setPaymentOpen(false);
      toast.success("¡Pago procesado con éxito! Bienvenido a Wiru PRO");
    } finally {
      setIsProcessingPayment(false);
    }
  }, []);

  const value = useMemo<DemoModeContextValue>(
    () => ({
      isPro,
      paymentOpen,
      isProcessingPayment,
      openPaymentModal,
      closePaymentModal,
      activatePro,
      resetDemo,
      runAutomationSequence,
    }),
    [
      activatePro,
      closePaymentModal,
      isProcessingPayment,
      isPro,
      openPaymentModal,
      paymentOpen,
      resetDemo,
      runAutomationSequence,
    ],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
      <DemoPaymentModal />
    </DemoModeContext.Provider>
  );
}

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success ${className}`}
    >
      <BadgeCheck className="h-3.5 w-3.5" /> Plan PRO Activo
    </span>
  );
}

export function DemoUpgradeButton({
  className = "",
  label = "Pasar a Pro",
}: {
  className?: string;
  label?: string;
}) {
  const { isPro, openPaymentModal } = useDemoMode();

  if (isPro) return <ProBadge className={className} />;

  return (
    <button
      type="button"
      onClick={openPaymentModal}
      className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15 ${className}`}
    >
      <Sparkles className="h-4 w-4" /> {label}
    </button>
  );
}

export function ResetDemoButton({ className = "" }: { className?: string }) {
  const { resetDemo } = useDemoMode();

  return (
    <button
      type="button"
      onClick={resetDemo}
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted-foreground transition hover:border-destructive/40 hover:text-destructive ${className}`}
    >
      <RefreshCcw className="h-3.5 w-3.5" /> Reset Demo
    </button>
  );
}

function DemoPaymentModal() {
  const { paymentOpen, closePaymentModal, activatePro, isProcessingPayment } = useDemoMode();
  const [form, setForm] = useState<PaymentFormState>(DEFAULT_PAYMENT);

  useEffect(() => {
    if (paymentOpen) setForm(DEFAULT_PAYMENT);
  }, [paymentOpen]);

  if (!paymentOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await activatePro(form);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closePaymentModal} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary-glow to-success" />
        <div className="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
          <div className="bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-6">
            <p className="label-tag text-primary">Stripe Sandbox</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Activa Wiru PRO</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Entorno de prueba: acepta cualquier tarjeta. El flujo tarda 2.5 segundos para simular
              un cobro real.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/80 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Wiru PRO</span>
                <span>S/ 14.90 / mes</span>
              </div>
              <p className="mt-3 text-3xl font-semibold">S/ 14.90</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrevistas ilimitadas, vacantes completas y exportaciones demo.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-primary" /> Datos de pago
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Nombre del titular">
                <input
                  value={form.cardholderName}
                  onChange={(e) => setForm((p) => ({ ...p, cardholderName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Número de tarjeta">
                <input
                  value={form.cardNumber}
                  onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiración">
                  <input
                    value={form.expiry}
                    onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
                    placeholder="12/30"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="CVC">
                  <input
                    value={form.cvc}
                    onChange={(e) => setForm((p) => ({ ...p, cvc: e.target.value }))}
                    placeholder="123"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={closePaymentModal}
                className="flex-1 rounded-full border border-border bg-surface px-4 py-3 text-sm hover:bg-surface-elevated transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isProcessingPayment ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
