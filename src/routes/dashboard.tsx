import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/lib/session";
import {
  Home,
  FileText,
  BarChart3,
  Briefcase,
  ClipboardList,
  Mic,
  Plus,
  ChevronDown,
} from "lucide-react";
import { WiruLogo } from "@/components/WiruLogo";
import { DemoUpgradeButton, ProBadge, ResetDemoButton } from "@/components/demo-mode";
import { useDemoMode } from "@/lib/demo-mode";
import { MOCK_TARGET, MOCK_USER } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Mis pasos", icon: Home, exact: true },
  { to: "/dashboard/cv", label: "Mi CV", icon: FileText },
  { to: "/dashboard/analysis", label: "Mi análisis", icon: BarChart3 },
  { to: "/dashboard/vacantes", label: "Vacantes", icon: Briefcase },
  { to: "/dashboard/postulaciones", label: "Mis postulaciones", icon: ClipboardList },
  { to: "/dashboard/entrevistas", label: "Entrevistas", icon: Mic },
];

function DashboardLayout() {
  const location = useLocation();
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email || "");
  const { isPro } = useDemoMode();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const session = getSessionUser();
        if (session) {
          if (session.name) setName(session.name as string);
          if (session.email) setEmail(session.email as string);
          return;
        }

        const raw = localStorage.getItem("wiru_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u.name) setName(u.name);
          if (u.email) setEmail(u.email);
        }
      } catch (error) {
        void error;
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (fixed on desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar z-20">
        <div className="px-5 py-5">
          <Link to="/">
            <WiruLogo />
          </Link>
        </div>

        <div className="px-5 pb-4">
          <p className="text-sm font-medium">Hola, {name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">IA de Wiru lista para ti</p>
        </div>

        <div className="px-3">
          <button className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm hover:bg-surface-elevated transition">
            <div className="min-w-0">
              <p className="truncate text-xs text-text-muted">Búsqueda activa</p>
              <p className="truncate font-medium">{MOCK_TARGET.role}</p>
              <p className="truncate text-xs text-muted-foreground">{MOCK_TARGET.company}</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition">
            <Plus className="h-3.5 w-3.5" /> Nueva búsqueda
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            {isPro ? <ProBadge /> : <DemoUpgradeButton label="Pasar a Pro" />}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              ★ 1 crédito gratis
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--gradient-primary)", color: "var(--background)" }}
            >
              {(name && name.charAt(0)) || "W"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-text-muted">{email}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <ResetDemoButton />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/">
          <WiruLogo />
        </Link>
        <select
          value={location.pathname}
          onChange={(e) => (window.location.href = e.target.value)}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs"
        >
          {NAV.map((n) => (
            <option key={n.to} value={n.to}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main (shifted right on desktop to make room for fixed sidebar) */}
      <main className="flex-1 overflow-x-hidden pt-14 md:pt-0 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
