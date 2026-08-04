CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  body text NOT NULL DEFAULT '',
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is public" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, body, image_path) VALUES (
  'about',
  E'Mijn naam is Dennis Hagemeijer. Fotografie begon voor mij als een manier om beter te kijken: naar het licht op een dauwdruppel, naar de spanning op een gezicht in de zestien, naar het ritme van een straat op een gewone dinsdagmiddag.\n\nWat begon met wandelingen door de Nederlandse natuur groeide uit tot vier vaste richtingen in mijn werk. In macro zoek ik de wereld die je met het blote oog mist. In natuur gaat het om geduld en het juiste moment. Street is ongepland en eerlijk. En voetbal is emotie in een fractie van een seconde — elke wedstrijd krijgt zijn eigen serie.\n\nIk werk het liefst rustig en dichtbij, met natuurlijk licht en zo min mogelijk bewerking. Een goede foto vertelt iets wat je zelf niet in woorden had gekregen.\n\nWil je werk van mij aan de muur, of heb je een vraag over een serie? Neem gerust contact op — ik denk graag mee.',
  '/__l5e/assets-v1/f8efd566-4d95-4460-86b2-39f2e3be6e69/portret.png'
);