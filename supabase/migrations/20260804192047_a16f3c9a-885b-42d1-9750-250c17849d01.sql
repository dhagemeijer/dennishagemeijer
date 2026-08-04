ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.subcollections ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS collections_keywords_idx ON public.collections USING gin (keywords);
CREATE INDEX IF NOT EXISTS subcollections_keywords_idx ON public.subcollections USING gin (keywords);
CREATE INDEX IF NOT EXISTS photos_keywords_idx ON public.photos USING gin (keywords);