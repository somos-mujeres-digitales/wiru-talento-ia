import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CreditCard, Loader2, RefreshCcw, Sparkles, BadgeCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_PAYMENT,
  DemoModeContext,
  DemoModeContextValue,
  PaymentFormState,
  clearDemoStorage,
  setStoredPro,
  sleep,
  useDemoMode,
  useProSnapshot,
  formatCardNumber,
  detectCardBrand,
  luhnCheck,
  generateTransactionId,
  createReceiptBlob,
} from "@/lib/demo-mode";

function maskCard(card: string) {
  const digits = (card || "").replace(/\D/g, "");
  if (!digits) return "";
  const masked = digits.replace(/\d(?=\d{4})/g, "*");
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

function maskCvc(cvc: string) {
  const len = (cvc || "").replace(/\D/g, "").length || 3;
  return "*".repeat(len);
}

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
  const [brand, setBrand] = useState<string>("unknown");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [lastReceiptBlob, setLastReceiptBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardFocused, setCardFocused] = useState(false);
  const [cvcFocused, setCvcFocused] = useState(false);
  const [revealCard, setRevealCard] = useState(false);
  const [revealCvc, setRevealCvc] = useState(false);

  useEffect(() => {
    if (paymentOpen) setForm(DEFAULT_PAYMENT);
  }, [paymentOpen]);

  useEffect(() => {
    setBrand(detectCardBrand(form.cardNumber));
  }, [form.cardNumber]);

  if (!paymentOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.cardholderName || form.cardholderName.trim().length < 3) {
      toast.error("Nombre del titular inválido");
      return;
    }
    if (form.cardNumber.replace(/\D/g, "").length < 13) {
      toast.error("Número de tarjeta incompleto");
      return;
    }
    if (!luhnCheck(form.cardNumber)) {
      toast.error("Número de tarjeta inválido (falló Luhn)");
      return;
    }

    try {
      setIsProcessing(true);
      await sleep(1200);
      const success = Math.random() < 0.92;
      if (!success) {
        toast.error("Pago rechazado por el emisor. Intenta con otra tarjeta.");
        return;
      }

      const tx = generateTransactionId();
      setLastTxId(tx);
      setStoredPro(true);
      toast.success("Pago aprobado. Bienvenido a Wiru PRO");

      const mask = `**** **** **** ${form.cardNumber.replace(/\s+/g, "").slice(-4)}`;
      const blob = await createReceiptBlob({
        id: tx,
        amount: "S/ 14.90",
        cardMask: mask,
        name: form.cardholderName,
      });
      setLastReceiptBlob(blob);
      setShowReceipt(true);
      setIsProcessing(false);
      // close modal after a short moment to show success
      setTimeout(() => closePaymentModal(), 600);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
        <div
          className="absolute inset-0"
          onClick={() => {
            if (!isProcessingPayment && !isProcessing) closePaymentModal();
          }}
        />
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary-glow to-success" />
          <div className="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
            <div className="bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-6">
              <p className="label-tag text-primary">Stripe Sandbox</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Activa Wiru PRO</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Entorno de prueba: acepta tarjetas comunes. El flujo simula tiempos y errores
                reales.
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
                <Field
                  label={`Número de tarjeta ${brand !== "unknown" ? `· ${brand.toUpperCase()}` : ""}`}
                >
                  <div className="relative">
                    <input
                      value={
                        cardFocused || revealCard
                          ? formatCardNumber(form.cardNumber)
                          : maskCard(form.cardNumber)
                      }
                      onFocus={() => setCardFocused(true)}
                      onBlur={() => setCardFocused(false)}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cardNumber: e.target.value.replace(/\D/g, "") }))
                      }
                      placeholder="4242 4242 4242 4242"
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      aria-label="Mostrar tarjeta"
                      onClick={() => setRevealCard((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground"
                    >
                      {revealCard ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                    <div className="relative">
                      <input
                        value={cvcFocused || revealCvc ? form.cvc : maskCvc(form.cvc)}
                        onFocus={() => setCvcFocused(true)}
                        onBlur={() => setCvcFocused(false)}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, "") }))
                        }
                        placeholder="123"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-sm outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        aria-label="Mostrar CVC"
                        onClick={() => setRevealCvc((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground"
                      >
                        {revealCvc ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
                <div className="text-xs text-muted-foreground">
                  Prueba con tarjetas comunes: Visa (4242...), Mastercard (5555...), Amex (3782...)
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isProcessing && !isProcessingPayment) closePaymentModal();
                  }}
                  className="flex-1 rounded-full border border-border bg-surface px-4 py-3 text-sm hover:bg-surface-elevated transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment || isProcessing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessingPayment || isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isProcessingPayment || isProcessing ? "Procesando..." : "Confirmar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ReceiptModal txId={lastTxId} blob={lastReceiptBlob} onClose={() => setShowReceipt(false)} />
    </>
  );
}

function ReceiptModal({
  txId,
  blob,
  onClose,
}: {
  txId: string | null;
  blob: Blob | null;
  onClose: () => void;
}) {
  if (!txId || !blob) return null;

  const download = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${txId}-receipt.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background p-6">
        <h3 className="text-lg font-semibold">Recibo de pago</h3>
        <p className="mt-2 text-sm text-muted-foreground">ID de transacción: {txId}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={download}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Descargar recibo
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm">
            Cerrar
          </button>
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
