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
  cardholderName: "María Fernanda Quispe",
  cardNumber: "4242 4242 4242 4242",
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
