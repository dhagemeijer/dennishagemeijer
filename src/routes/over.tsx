import { createFileRoute } from "@tanstack/react-router";
import portret from "@/assets/portret.jpg";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/over")({
  head: () => ({
    meta: [
      { title: "Over de fotograaf — Dennis Hagemeijer Fotografie" },
      {
        name: "description",
        content:
          "Maak kennis met Dennis Hagemeijer: fotograaf van macro, natuur, street en voetbal in Nederland.",
      },
      { property: "og:title", content: "Over de fotograaf — Dennis Hagemeijer" },
      {
        property: "og:description",
        content: "Het verhaal achter de foto's: macro, natuur, street en voetbal.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-8">
      <PageHeader eyebrow="Over" title="Over de fotograaf" />
      <div className="page-shell grid gap-12 md:grid-cols-[2fr_3fr] md:items-start">
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={portret}
            alt="Portret van Dennis Hagemeijer"
            width={1024}
            height={1280}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            Mijn naam is Dennis Hagemeijer. Fotografie begon voor mij als een manier om beter te
            kijken: naar het licht op een dauwdruppel, naar de spanning op een gezicht in de
            zestien, naar het ritme van een straat op een gewone dinsdagmiddag.
          </p>
          <p>
            Wat begon met wandelingen door de Nederlandse natuur groeide uit tot vier vaste
            richtingen in mijn werk. In <strong className="text-foreground">macro</strong> zoek ik
            de wereld die je met het blote oog mist. In{" "}
            <strong className="text-foreground">natuur</strong> gaat het om geduld en het juiste
            moment. <strong className="text-foreground">Street</strong> is ongepland en eerlijk. En{" "}
            <strong className="text-foreground">voetbal</strong> is emotie in een fractie van een
            seconde — elke wedstrijd krijgt zijn eigen serie.
          </p>
          <p>
            Ik werk het liefst rustig en dichtbij, met natuurlijk licht en zo min mogelijk
            bewerking. Een goede foto vertelt iets wat je zelf niet in woorden had gekregen.
          </p>
          <p>
            Wil je werk van mij aan de muur, of heb je een vraag over een serie? Neem gerust
            contact op — ik denk graag mee.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Deze tekst is een eerste opzet en wordt later aangevuld.
          </p>
        </div>
      </div>
    </div>
  );
}
