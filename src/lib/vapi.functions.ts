import { createServerFn } from "@tanstack/react-start";

export type VapiConfig = {
  publicKey: string;
  assistantId: string;
  configured: boolean;
};

function readEnv(key: string) {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || "";
  }

  return "";
}

function readViteEnv(key: string) {
  return (import.meta.env as Record<string, string | undefined>)[key] || "";
}

/**
 * Returns the VAPI client configuration needed by the browser SDK.
 * The "public key" is designed to be exposed to the browser (per VAPI docs),
 * but we also expose a sync reader so the client can boot without waiting for
 * a round-trip during hydration.
 */
export function readVapiConfig(): VapiConfig {
  const publicKey =
    readEnv("VAPI_PUBLIC_KEY") ||
    readEnv("VITE_VAPI_PUBLIC_KEY") ||
    readViteEnv("VITE_VAPI_PUBLIC_KEY") ||
    "";

  const assistantId =
    readEnv("VAPI_ASSISTANT_ID") ||
    readEnv("VITE_VAPI_ASSISTANT_ID") ||
    readViteEnv("VITE_VAPI_ASSISTANT_ID") ||
    "";

  return {
    publicKey,
    assistantId,
    configured: Boolean(publicKey),
  };
}

export const getVapiConfig = createServerFn({ method: "GET" }).handler(async () => {
  return readVapiConfig();
});
