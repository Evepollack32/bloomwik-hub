
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
       id, 'Mira Hallström', '/src/assets/featured-travel.jpg',
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
       id, 'Inès Laurent', '/src/assets/cat-fashion.jpg',
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
       id, 'Jules Romano', '/src/assets/cat-food.jpg',
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
       id, 'Daniel Park', '/src/assets/cat-technology.jpg',
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
       id, 'Yasmine El Idrissi', '/src/assets/cat-travel.jpg',
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
       id, 'Tomás Vidal', '/src/assets/cat-culture.jpg',
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
