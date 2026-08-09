-- 1) Per-locale origin for articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en-US';
CREATE INDEX IF NOT EXISTS articles_locale_idx ON public.articles (locale);

-- 2) Full per-locale fields on translations (independent slug/keywords/media)
ALTER TABLE public.article_translations
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_alt text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS twitter_image text,
  ADD COLUMN IF NOT EXISTS reading_minutes integer,
  ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS article_translations_slug_locale_key
  ON public.article_translations (locale, slug) WHERE slug IS NOT NULL;

-- 3) Sponsored offers, per locale
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL DEFAULT 'en-US',
  title text NOT NULL,
  description text,
  image_url text,
  link_url text NOT NULL,
  cta_label text NOT NULL DEFAULT 'View offer',
  badge text,
  price text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  weight integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offers_public_read ON public.offers;
CREATE POLICY offers_public_read ON public.offers FOR SELECT USING (active = true);

DROP POLICY IF EXISTS offers_admin_write ON public.offers;
CREATE POLICY offers_admin_write ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_offers_updated ON public.offers;
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS offers_locale_active_idx ON public.offers (locale, active);