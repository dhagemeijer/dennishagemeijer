import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useBasket } from "@/lib/basket";
import { useAuth } from "@/hooks/useAuth";
import wordmark from "@/assets/wordmark.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/collecties", label: "Collecties" },
  { to: "/over", label: "Over" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const basketCount = useBasket().length;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="page-shell flex h-24 items-center justify-between gap-8">
        <Link to="/" aria-label="Dennis Hagemeijer Fotografie" onClick={() => setOpen(false)}>
          <img
            src={wordmark}
            alt="Dennis Hagemeijer Fotografie"
            width={1780}
            height={844}
            className="h-14 w-auto opacity-90 transition-opacity duration-300 hover:opacity-100 sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground after:w-full" }}
              className="relative py-1 text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/bestellen"
            aria-label={`Selectie (${basketCount})`}
            className="relative flex items-center gap-2 text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase transition-colors duration-300 hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            <ShoppingBag className="size-4" />
            {basketCount > 0 ? (
              <span className="text-primary">{basketCount}</span>
            ) : null}
          </Link>
          {isAdmin ? (
            <Link
              to="/admin"
              className="text-[0.6875rem] tracking-[0.22em] text-primary uppercase transition-opacity duration-300 hover:opacity-70"
            >
              Beheer
            </Link>
          ) : user ? null : (
            <Link
              to="/auth"
              className="text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase transition-colors duration-300 hover:text-foreground"
            >
              Inloggen
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="text-foreground md:hidden"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="page-shell flex flex-col py-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/bestellen"
              onClick={() => setOpen(false)}
              className="py-3 text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase"
            >
              Selectie{basketCount > 0 ? ` (${basketCount})` : ""}
            </Link>
            <Link
              to={isAdmin ? "/admin" : "/auth"}
              onClick={() => setOpen(false)}
              className="py-3 text-[0.6875rem] tracking-[0.22em] text-primary uppercase"
            >
              {isAdmin ? "Beheer" : "Inloggen"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
