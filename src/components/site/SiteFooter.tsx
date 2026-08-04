import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="page-shell grid gap-10 py-16 md:grid-cols-3">
        <div>
          <span className="font-display text-sm font-semibold tracking-tight uppercase">
            Dennis Hagemeijer Fotografie
          </span>
          <span className="rule-accent mt-4" />
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
            Macro, natuur, street en voetbal — vastgelegd in Nederland.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[0.6875rem] tracking-[0.22em] text-primary uppercase">Navigatie</p>
          <ul className="mt-4 space-y-2 text-ink-foreground/70">
            <li>
              <Link to="/collecties" className="hover:text-ink-foreground">
                Collecties
              </Link>
            </li>
            <li>
              <Link to="/over" className="hover:text-ink-foreground">
                Over de fotograaf
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-ink-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-[0.6875rem] tracking-[0.22em] text-primary uppercase">Contact</p>
          <ul className="mt-4 space-y-2 text-ink-foreground/70">
            <li>info@dennishagemeijerfotografie.nl</li>
            <li>Nederland</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="page-shell flex flex-col gap-2 py-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Dennis Hagemeijer Fotografie</span>
          <span>Alle foto&apos;s zijn auteursrechtelijk beschermd.</span>
        </div>
      </div>
    </footer>
  );
}
