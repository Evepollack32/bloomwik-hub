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

CREATE POLICY "article_images_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'article-images');
CREATE POLICY "article_images_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "article_images_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'article-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "article_images_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images' AND public.has_role(auth.uid(),'admin'));

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, featured, published_at, geo_country, geo_region, geo_city)
SELECT 'fjords-at-first-light',
       'Fjords at first light: a slow week along Norway''s western coast',
       'Eight days, two ferries and one very patient cabin host — what we learned tracing the edge of the Atlantic by foot.',
       ARRAY[
         'The ferry pulled away from Bergen just before sunrise, when the harbor was still the color of pewter and only the gulls were awake. I had a thermos of black coffee, a paperback I would not open, and a vague plan to spend the next eight days walking the western edge of Norway as slowly as the season would allow.',
         'There is a particular kind of silence in the fjords at first light. It is not the silence of an empty room, which always feels accidental, but the considered silence of a cathedral — a hush you suspect has been arranged for you. The cliffs lean in. The water lies completely flat. Somewhere far above, a single sheep makes a sound that travels for a kilometer.',
         'By the third day I had stopped checking my phone. By the fifth I had stopped checking the weather. By the seventh I was eating brown cheese on rye and treating the morning rain as a kind of weather-borne friend.',
         'If you are tempted by a slow week of your own, here is the only advice that ever held: book the ferries first, then the cabins, then nothing else.'
       ],
       id, 'Mira Hallström', '/images/featured-travel.jpg',
       'A traveler standing on a cliff above misty Norwegian fjords at sunrise',
       9, true, true, '2026-04-22', 'Norway', 'Vestland', 'Bergen'
FROM public.categories WHERE slug='travel';

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, published_at, geo_country, geo_region, geo_city)
SELECT 'the-quiet-revival-of-tailoring',
       'The quiet revival of tailoring',
       'After a decade of relaxed fits, the suit is creeping back — but on its own terms.',
       ARRAY[
         'The runways this spring told a story that the street has been whispering for at least a year: tailoring is back, and it is far more interesting than the last time around.',
         'Where the sharp-shouldered nineties suit announced itself from across a room, the new tailoring is quieter. Shoulders are softer; lapels narrower; trousers cut to skim rather than cling. It is a silhouette built for movement, for an espresso at the bar, for catching a train.',
         'The most surprising thing is the colour. After several seasons of dutiful black and grey, designers have rediscovered emerald, oxblood and deep navy — colours that look, in the right light, almost edible.'
       ],
       id, 'Inès Laurent', '/images/cat-fashion.jpg',
       'A model in an emerald silk gown on a marble staircase',
       6, true, '2026-04-18', 'France', 'Île-de-France', 'Paris'
FROM public.categories WHERE slug='fashion';

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, published_at, geo_country, geo_region, geo_city)
SELECT 'a-tomato-is-a-promise',
       'A tomato is a promise: the case for cooking with the season',
       'On the politics, pleasure and quiet patience of refusing the supermarket calendar.',
       ARRAY[
         'Twice a week, all summer, my grandmother walked the long way home from the market with two heavy bags of tomatoes. Not for sauce — that was a different errand — but for eating. Sliced thick, salted hard, and laid on bread that had been rubbed with the cut side of a clove of garlic.',
         'The first time I tasted a winter tomato as an adult I was furious. It was not the tomato''s fault, of course. It had been picked weeks too early, shipped half a continent, and asked to taste like August in February. It tasted like nothing.',
         'Cooking with the season is not, in the end, a moral position. It is a practical one. The tomato in August is the tomato. Everything else is an impression of one.'
       ],
       id, 'Jules Romano', '/images/cat-food.jpg',
       'Overhead view of fresh pasta, tomatoes and olive oil on a wooden table',
       7, true, '2026-04-15', 'Italy', 'Lazio', 'Rome'
FROM public.categories WHERE slug='food';

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, published_at, geo_country, geo_region, geo_city)
SELECT 'the-end-of-the-everything-app',
       'The end of the everything app',
       'Why the next decade of consumer tech might be small, single-purpose and human-scale again.',
       ARRAY[
         'For the last fifteen years the dominant logic of consumer software has been accumulation. Add a feed. Add a marketplace. Add payments, then video, then AI. The end state of every app, eventually, was every app.',
         'That logic is starting to crack. Users are tiring of bundles they did not ask for; regulators are tiring of conglomerates they cannot supervise; designers are tiring of homepages that have to please everyone.',
         'The next decade may belong to small, opinionated tools that do exactly one thing — and have the good manners to leave when they are done.'
       ],
       id, 'Daniel Park', '/images/cat-technology.jpg',
       'A laptop and AR glasses lit by deep purple light',
       8, true, '2026-04-10', 'United States', 'California', 'San Francisco'
FROM public.categories WHERE slug='technology';

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, published_at, geo_country, geo_region, geo_city)
SELECT 'marrakech-after-dark',
       'Marrakech after dark: a night-walker''s guide to the medina',
       'A poet, a pastry chef and a taxi driver walk into a riad. Notes from forty-eight hours of staying up too late.',
       ARRAY[
         'If you have only seen Marrakech in daylight you have only seen half of it. The other half — the half locals quietly prefer — begins around the time the muezzin calls for the fourth prayer and the city, suddenly cooler, opens its second eye.',
         'On my first night I followed a poet from a mint-tea bar to a hidden courtyard where a woman was selling honey pastries off a folding table. On my second night I followed the smell of charcoal to a small alley where five men were grilling sardines and arguing politely about football.',
         'Bring small notes. Bring better shoes than you think you need. Bring nothing important to do tomorrow.'
       ],
       id, 'Yasmine El Idrissi', '/images/cat-travel.jpg',
       'Sunset over the Marrakech medina with hanging lanterns',
       7, true, '2026-04-04', 'Morocco', 'Marrakech-Safi', 'Marrakech'
FROM public.categories WHERE slug='travel';

INSERT INTO public.articles (slug, title, excerpt, body, category_id, author, image_url, image_alt, reading_minutes, published, published_at, geo_country, geo_region, geo_city)
SELECT 'what-museums-keep-getting-wrong',
       'What museums keep getting wrong about young visitors',
       'It isn''t the lighting. It isn''t the gift shop. It''s the building''s idea of what attention is supposed to look like.',
       ARRAY[
         'Every six months a museum somewhere announces a campaign to attract younger visitors. The campaign almost always involves a TikTok account, a slightly cheaper ticket, and an installation in the lobby that lights up when you wave at it.',
         'The problem is rarely the marketing. The problem is the building''s quiet insistence that the right way to look at a painting is in silence, alone, for exactly the length of time the wall text suggests.',
         'Younger visitors are not refusing to pay attention. They are refusing to pay attention in the particular shape museums have been asking them to. The museums that have understood this — quietly redesigning their galleries for conversation, for sitting, for coming back twice — are filling up.'
       ],
       id, 'Tomás Vidal', '/images/cat-culture.jpg',
       'A magenta gallery wall with a single illuminated painting',
       6, true, '2026-03-29', 'Spain', 'Catalonia', 'Barcelona'
FROM public.categories WHERE slug='culture';

UPDATE public.articles
SET content_html = COALESCE((
  SELECT string_agg('<p>' || p || '</p>', '') FROM unnest(body) AS p
), '')
WHERE content_html = '';

INSERT INTO public.authors (slug, name, title, bio)
SELECT DISTINCT
  regexp_replace(lower(trim(a.author)), '[^a-z0-9]+', '-', 'g'),
  a.author,
  'Contributing Editor',
  a.author || ' writes for Atlas & Ember.'
FROM public.articles a
WHERE a.author IS NOT NULL AND trim(a.author) <> ''
ON CONFLICT (slug) DO NOTHING;

UPDATE public.articles a
SET author_id = au.id
FROM public.authors au
WHERE au.slug = regexp_replace(lower(trim(a.author)), '[^a-z0-9]+', '-', 'g')
  AND a.author_id IS NULL;

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  locale text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'footer',
  status text NOT NULL DEFAULT 'subscribed',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers_public_insert" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage messages" ON public.contact_messages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_article_idx ON public.comments(article_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved comments are public" ON public.comments
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "admins manage comments" ON public.comments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.page_views (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  referrer text,
  country text,
  locale text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_idx ON public.page_views(created_at DESC);
CREATE INDEX page_views_article_idx ON public.page_views(article_id);
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read page views" ON public.page_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings are public read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('general', jsonb_build_object(
     'site_name','Atlas & Ember',
     'tagline','The world, in stories',
     'description','Travel, fashion, food, technology and culture — written for the curious, translated for everyone.',
     'default_og_image','',
     'twitter_handle','',
     'google_site_verification','',
     'ga_measurement_id','',
     'comments_enabled', true,
     'comments_auto_approve', false
  ))
ON CONFLICT (key) DO NOTHING;