
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE public.ad_slot   AS ENUM ('leaderboard', 'billboard', 'square', 'inline');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role     public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  blurb       text,
  hex_color   text NOT NULL DEFAULT '#0A192F',
  sort_order  int  NOT NULL DEFAULT 0,
  seo_title   text,
  seo_description text,
  focus_keyword text,
  seo_keywords text[] NOT NULL DEFAULT '{}',
  og_image    text,
  hero_image  text,
  noindex     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  email text,
  website text,
  twitter text,
  instagram text,
  linkedin text,
  seo_title text,
  seo_description text,
  focus_keyword text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.authors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
GRANT ALL ON public.authors TO service_role;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY authors_public_read ON public.authors FOR SELECT USING (true);
CREATE POLICY authors_admin_write ON public.authors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_authors_updated BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.articles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  title            text NOT NULL,
  excerpt          text NOT NULL DEFAULT '',
  body             text[] NOT NULL DEFAULT '{}',
  content_html     text NOT NULL DEFAULT '',
  category_id      uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  author           text NOT NULL DEFAULT 'Atlas & Ember',
  author_id        uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  image_url        text,
  image_alt        text,
  reading_minutes  int  NOT NULL DEFAULT 5,
  published        boolean NOT NULL DEFAULT false,
  featured         boolean NOT NULL DEFAULT false,
  published_at     timestamptz,
  geo_country      text,
  geo_region       text,
  geo_city         text,
  tags             text[] NOT NULL DEFAULT '{}',
  seo_title        text,
  seo_description  text,
  seo_keywords     text,
  focus_keyword    text,
  canonical_url    text,
  og_title         text,
  og_description   text,
  og_image         text,
  twitter_card     text NOT NULL DEFAULT 'summary_large_image',
  twitter_title    text,
  twitter_description text,
  twitter_image    text,
  article_section  text,
  seo_score        integer NOT NULL DEFAULT 0,
  faq              jsonb NOT NULL DEFAULT '[]'::jsonb,
  noindex          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_articles_category   ON public.articles(category_id);
CREATE INDEX idx_articles_author_id  ON public.articles(author_id);
CREATE INDEX idx_articles_published  ON public.articles(published, published_at DESC);
CREATE INDEX idx_articles_featured   ON public.articles(featured) WHERE featured = true;
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slot         public.ad_slot NOT NULL,
  html_snippet text,
  image_url    text,
  link_url     text,
  active       boolean NOT NULL DEFAULT true,
  weight       int NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ads_slot_active ON public.ads(slot, active);
GRANT SELECT ON public.ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ads_updated BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.article_translations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  locale      text NOT NULL,
  title       text,
  excerpt     text,
  body        text[] NOT NULL DEFAULT '{}',
  body_html   text NOT NULL DEFAULT '',
  meta_title  text,
  meta_description text,
  focus_keyword text,
  keywords    text[] NOT NULL DEFAULT '{}',
  og_title    text,
  og_description text,
  twitter_title text,
  twitter_description text,
  canonical_url text,
  status      text NOT NULL DEFAULT 'published',
  source      text NOT NULL DEFAULT 'ai',
  cached_at   timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, locale)
);
GRANT SELECT ON public.article_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_translations TO authenticated;
GRANT ALL ON public.article_translations TO service_role;
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_translations_updated BEFORE UPDATE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "profiles_self_select"  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_self_update"  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_self_insert"  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "user_roles_self_select"  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_select" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_write"  ON public.user_roles FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "articles_public_read"   ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "articles_admin_read"    ON public.articles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "articles_admin_write"   ON public.articles FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "ads_public_read"        ON public.ads FOR SELECT USING (active = true);
CREATE POLICY "ads_admin_read"         ON public.ads FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ads_admin_write"        ON public.ads FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "translations_public_read" ON public.article_translations FOR SELECT USING (status = 'published');
CREATE POLICY "translations_admin_write" ON public.article_translations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (user_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.categories (slug, name, blurb, hex_color, sort_order) VALUES
  ('travel',     'Travel',     'Field notes from the road, the rail and the runway.',  '#B33B3B', 1),
  ('fashion',    'Fashion',    'Style as language — read between the seams.',           '#B33B3B', 2),
  ('food',       'Food',       'Recipes, restaurants and rituals around the table.',    '#2B7A4B', 3),
  ('technology', 'Technology', 'Tools, ideas and the people building tomorrow.',        '#0A192F', 4),
  ('culture',    'Culture',    'Art, music, books and the conversation around them.',   '#6A3E9A', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.ads (name, slot, html_snippet, link_url, active, weight) VALUES
  ('Demo leaderboard', 'leaderboard', null, 'https://example.com', true, 1),
  ('Demo billboard',   'billboard',   null, 'https://example.com', true, 1),
  ('Demo square',      'square',      null, 'https://example.com', true, 1),
  ('Demo inline',      'inline',      null, 'https://example.com', true, 1);
