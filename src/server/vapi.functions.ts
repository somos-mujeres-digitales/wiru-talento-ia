import { createServerFn } from "@tanstack/react-start";

/**
 * Returns the VAPI client configuration needed by the browser SDK.
 * The "public key" is designed to be exposed to the browser (per VAPI docs),
 * but we read it server-side so the user can rotate it via Lovable secrets
 * without redeploying.
 */
export const getVapiConfig = createServerFn({ method: "GET" }).handler(async () => {
  const publicKey = process.env.VAPI_PUBLIC_KEY || "";
  const assistantId = process.env.VAPI_ASSISTANT_ID || "";
  return {
    publicKey,
    assistantId,
    configured: Boolean(publicKey),
  };
});
