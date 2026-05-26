import { createContext, useContext, useSyncExternalStore } from "react";

export const PRO_KEY = "wiru_pro";
export const DEMO_CHANGE_EVENT = "wiru-demo-pro-change";

export type PaymentFormState = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export const DEFAULT_PAYMENT: PaymentFormState = {
  cardholderName: "Aaron Orellana",
  cardNumber: "4532 7182 9381 0247",
  expiry: "12/30",
  cvc: "123",
};

export type DemoModeContextValue = {
  isPro: boolean;
  paymentOpen: boolean;
  isProcessingPayment: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  activatePro: (payload: PaymentFormState) => Promise<void>;
  resetDemo: () => void;
  runAutomationSequence: (onComplete?: () => void) => void;
};

export const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return context;
}

export function getStoredPro() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PRO_KEY) === "true";
}

export function emitDemoChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}

export function setStoredPro(next: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRO_KEY, String(next));
  emitDemoChange();
}

export function clearDemoStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.clear();
  emitDemoChange();
}

export function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === PRO_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(DEMO_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DEMO_CHANGE_EVENT, listener);
  };
}

export function useProSnapshot() {
  return useSyncExternalStore(subscribe, getStoredPro, () => false);
}

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

// --- Payment helpers (client-only) ---------------------------------
export function formatCardNumber(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function detectCardBrand(cardNumber: string) {
  const n = cardNumber.replace(/\s+/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]\d|7[01])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function luhnCheck(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function generateTransactionId() {
  return `tx_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export async function createReceiptBlob(opts: {
  id: string;
  amount: string;
  cardMask: string;
  name: string;
}) {
  const { id, amount, cardMask, name } = opts;
  const content = `Recibo de pago\n\nID: ${id}\nNombre: ${name}\nCuenta: ${cardMask}\nImporte: ${amount}\nFecha: ${new Date().toLocaleString()}`;
  const blob = new Blob([content], { type: "text/plain" });
  return blob;
}
