import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vapi/webhook")({
  server: {
    handlers: {
      GET: () => Response.json({ ok: true }),
      POST: async () => Response.json({ ok: true }, { status: 200 }),
    },
  },
});
