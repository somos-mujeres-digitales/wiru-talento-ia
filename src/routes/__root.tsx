import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { DemoModeProvider } from "@/components/demo-mode";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wiru IA — Consigue tu primer empleo en Cusco" },
      {
        name: "description",
        content:
          "Wiru IA analiza tu CV, te prepara para la entrevista y hace seguimiento de tus postulaciones — todo en un solo lugar.",
      },
      { name: "author", content: "Wiru IA" },
      { property: "og:title", content: "Wiru IA — Consigue tu primer empleo en Cusco" },
      {
        property: "og:description",
        content: "Análisis de CV con IA, simulación de entrevistas y tracker de postulaciones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Wiru IA — Consigue tu primer empleo en Cusco" },
      {
        name: "description",
        content: "AI-powered job search platform for young talent in Cusco, Peru.",
      },
      {
        property: "og:description",
        content: "AI-powered job search platform for young talent in Cusco, Peru.",
      },
      {
        name: "twitter:description",
        content: "AI-powered job search platform for young talent in Cusco, Peru.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dbd6a1ca-5cf2-4c32-a372-8ae54e79d4d0/id-preview-09e20bfe--5d5b62a0-dca3-47ef-84c7-4e2b4258fd66.lovable.app-1777909968038.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dbd6a1ca-5cf2-4c32-a372-8ae54e79d4d0/id-preview-09e20bfe--5d5b62a0-dca3-47ef-84c7-4e2b4258fd66.lovable.app-1777909968038.png",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE">
      <head>
        <HeadContent />
      </head>
      <body>
        <DemoModeProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </DemoModeProvider>
        <Scripts />
      </body>
    </html>
  );
}
