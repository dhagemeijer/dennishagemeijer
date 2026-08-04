import { Link } from "@tanstack/react-router";
import wordmark from "@/assets/wordmark.png";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="page-shell grid gap-12 py-20 md:grid-cols-3">
        <div>
          <img
            src={wordmark}
            alt="Dennis Hagemeijer Fotografie"
            loading="lazy"
            width={1780}
            height={844}
            className="h-10 w-auto opacity-80"
          />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Macro, natuur, street en voetbal — vastgelegd in Nederland.
          </p>
        </div>
        <div>
          <p className="eyebrow">Navigatie</p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/collecties" className="transition-colors duration-300 hover:text-foreground">
                Collecties
              </Link>
            </li>
            <li>
              <Link to="/over" className="transition-colors duration-300 hover:text-foreground">
                Over de fotograaf
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors duration-300 hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>info@dennishagemeijerfotografie.nl</li>
            <li>Nederland</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="page-shell flex flex-col gap-2 py-8 text-[0.6875rem] tracking-[0.14em] text-muted-foreground/60 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Dennis Hagemeijer Fotografie</span>
          <span>Alle foto&apos;s zijn auteursrechtelijk beschermd</span>
        </div>
      </div>
    </footer>
  );
}
