import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthorityBadge, SecurityBadge } from "@/components/omega/badges";
import { CONTACT_HANDLE, CONTACT_NAME, CONTACT_ORG, OMEGA_VERSION, PRIMARY_BOUNDARY } from "@/lib/omega/constants";
import { useOmegaStore } from "@/lib/omega/store";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sequence = useOmegaStore((s) => s.sequence);
  const authority = useOmegaStore((s) => s.authority);
  const security = useOmegaStore((s) => s.security);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => {
      useOmegaStore.getState().tick();
      setNow(Date.now());
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-12 items-center gap-3 px-3 sm:px-4">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="flex min-w-0 items-baseline gap-2">
            <span className="text-base font-medium tracking-tight">OMEGA</span>
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              v{OMEGA_VERSION}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2 overflow-hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:gap-3">
            <Link
              to="/voice"
              className="inline-flex size-11 items-center justify-center rounded-sm text-foreground hover:bg-accent"
              aria-label="Agent voice"
            >
              <Volume2 className="size-4" />
            </Link>
            <span className="hidden tabular-nums md:inline">seq {String(sequence).padStart(6, "0")}</span>
            <AuthorityBadge level={authority} />
            <SecurityBadge status={security} />
            <span className="hidden tabular-nums sm:inline">
              {now ? new Date(now).toISOString().slice(11, 19) : "--:--:--"}Z
            </span>
          </div>
        </div>
        <p className="hidden border-t border-border px-4 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:block">
          {PRIMARY_BOUNDARY}
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 border-r border-border lg:block">
          <NavList pathname={pathname} />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-64 max-w-[85vw] border-r border-border bg-card p-2 shadow-[var(--shadow-border)]">
            <NavList pathname={pathname} />
          </div>
        </div>
      ) : null}

      <div className="flex justify-end p-3 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => useOmegaStore.getState().reset()}>
          Reset fabric
        </Button>
      </div>

      <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <Link to="/partner" className="hover:text-foreground">
          {CONTACT_NAME} · {CONTACT_HANDLE} · {CONTACT_ORG}
        </Link>
        <span className="mx-2 hidden sm:inline">·</span>
        <span className="hidden sm:inline">Collaboration, sale, partnering</span>
      </footer>
    </div>
  );
}

function NavList({ pathname }: { pathname: string }) {
  let lastGroup = "";
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const showGroup = item.group !== lastGroup;
        lastGroup = item.group;
        const active = item.to === "/" ? pathname === "/" : pathname === item.to;
        return (
          <div key={item.to}>
            {showGroup ? (
              <p className="mb-1 mt-3 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground first:mt-0">
                {item.group}
              </p>
            ) : null}
            <Link
              to={item.to}
              className={cn(
                "flex h-11 items-center rounded-md px-3 text-sm transition-colors duration-150",
                active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 hidden justify-start lg:inline-flex"
        onClick={() => useOmegaStore.getState().reset()}
      >
        Reset fabric
      </Button>
    </nav>
  );
}
