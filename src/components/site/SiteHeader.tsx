import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/collecties", label: "Collecties" },
  { to: "/over", label: "Over de fotograaf" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="page-shell flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-display text-base font-semibold tracking-tight uppercase">
            Dennis Hagemeijer
          </span>
          <span className="mt-1 text-[0.6875rem] tracking-[0.28em] text-primary uppercase">
            Fotografie
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground after:w-full" }}
              className="relative py-1 text-sm text-muted-foreground transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Button asChild size="sm" variant="default">
              <Link to="/admin">Beheer</Link>
            </Button>
          ) : user ? null : (
            <Link
              to="/auth"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Inloggen
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border md:hidden">
          <nav className="page-shell flex flex-col py-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={isAdmin ? "/admin" : "/auth"}
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-primary"
            >
              {isAdmin ? "Beheer" : "Inloggen"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
