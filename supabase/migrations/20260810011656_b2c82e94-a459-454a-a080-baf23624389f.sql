ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS offers_article_id_idx ON public.offers(article_id);