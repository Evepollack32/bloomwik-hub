import featuredTravel from "@/assets/featured-travel.jpg";
import catTravel from "@/assets/cat-travel.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catFood from "@/assets/cat-food.jpg";
import catTechnology from "@/assets/cat-technology.jpg";
import catCulture from "@/assets/cat-culture.jpg";

export type CategorySlug = "travel" | "fashion" | "food" | "technology" | "culture";

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  hex: string;
}

export const CATEGORIES: Category[] = [
  { slug: "travel",     name: "Travel",     blurb: "Field notes from the road, the rail and the runway.", hex: "#B33B3B" },
  { slug: "fashion",    name: "Fashion",    blurb: "Style as language — read between the seams.",        hex: "#B33B3B" },
  { slug: "food",       name: "Food",       blurb: "Recipes, restaurants and rituals around the table.", hex: "#2B7A4B" },
  { slug: "technology", name: "Technology", blurb: "Tools, ideas and the people building tomorrow.",     hex: "#0A192F" },
  { slug: "culture",    name: "Culture",    blurb: "Art, music, books and the conversation around them.",hex: "#6A3E9A" },
];

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: CategorySlug;
  author: string;
  date: string;        // ISO
  readingMinutes: number;
  image: string;
  imageAlt: string;
  /** Plain-text paragraphs in English; AI-translated on demand. */
  body: string[];
  /** Country / region the story is set in — powers GEO meta. */
  geo: { country: string; region?: string; city?: string };
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  {
    slug: "fjords-at-first-light",
    title: "Fjords at first light: a slow week along Norway's western coast",
    excerpt: "Eight days, two ferries and one very patient cabin host — what we learned tracing the edge of the Atlantic by foot.",
    category: "travel",
    author: "Mira Hallström",
    date: "2026-04-22",
    readingMinutes: 9,
    image: featuredTravel,
    imageAlt: "A traveler standing on a cliff above misty Norwegian fjords at sunrise",
    geo: { country: "Norway", region: "Vestland", city: "Bergen" },
    featured: true,
    body: [
      "The ferry pulled away from Bergen just before sunrise, when the harbor was still the color of pewter and only the gulls were awake. I had a thermos of black coffee, a paperback I would not open, and a vague plan to spend the next eight days walking the western edge of Norway as slowly as the season would allow.",
      "There is a particular kind of silence in the fjords at first light. It is not the silence of an empty room, which always feels accidental, but the considered silence of a cathedral — a hush you suspect has been arranged for you. The cliffs lean in. The water lies completely flat. Somewhere far above, a single sheep makes a sound that travels for a kilometer.",
      "By the third day I had stopped checking my phone. By the fifth I had stopped checking the weather. By the seventh I was eating brown cheese on rye and treating the morning rain as a kind of weather-borne friend.",
      "If you are tempted by a slow week of your own, here is the only advice that ever held: book the ferries first, then the cabins, then nothing else.",
    ],
  },
  {
    slug: "the-quiet-revival-of-tailoring",
    title: "The quiet revival of tailoring",
    excerpt: "After a decade of relaxed fits, the suit is creeping back — but on its own terms.",
    category: "fashion",
    author: "Inès Laurent",
    date: "2026-04-18",
    readingMinutes: 6,
    image: catFashion,
    imageAlt: "A model in an emerald silk gown on a marble staircase",
    geo: { country: "France", region: "Île-de-France", city: "Paris" },
    body: [
      "The runways this spring told a story that the street has been whispering for at least a year: tailoring is back, and it is far more interesting than the last time around.",
      "Where the sharp-shouldered nineties suit announced itself from across a room, the new tailoring is quieter. Shoulders are softer; lapels narrower; trousers cut to skim rather than cling. It is a silhouette built for movement, for an espresso at the bar, for catching a train.",
      "The most surprising thing is the colour. After several seasons of dutiful black and grey, designers have rediscovered emerald, oxblood and deep navy — colours that look, in the right light, almost edible.",
    ],
  },
  {
    slug: "a-tomato-is-a-promise",
    title: "A tomato is a promise: the case for cooking with the season",
    excerpt: "On the politics, pleasure and quiet patience of refusing the supermarket calendar.",
    category: "food",
    author: "Jules Romano",
    date: "2026-04-15",
    readingMinutes: 7,
    image: catFood,
    imageAlt: "Overhead view of fresh pasta, tomatoes and olive oil on a wooden table",
    geo: { country: "Italy", region: "Lazio", city: "Rome" },
    body: [
      "Twice a week, all summer, my grandmother walked the long way home from the market with two heavy bags of tomatoes. Not for sauce — that was a different errand — but for eating. Sliced thick, salted hard, and laid on bread that had been rubbed with the cut side of a clove of garlic.",
      "The first time I tasted a winter tomato as an adult I was furious. It was not the tomato's fault, of course. It had been picked weeks too early, shipped half a continent, and asked to taste like August in February. It tasted like nothing.",
      "Cooking with the season is not, in the end, a moral position. It is a practical one. The tomato in August is the tomato. Everything else is an impression of one.",
    ],
  },
  {
    slug: "the-end-of-the-everything-app",
    title: "The end of the everything app",
    excerpt: "Why the next decade of consumer tech might be small, single-purpose and human-scale again.",
    category: "technology",
    author: "Daniel Park",
    date: "2026-04-10",
    readingMinutes: 8,
    image: catTechnology,
    imageAlt: "A laptop and AR glasses lit by deep purple light",
    geo: { country: "United States", region: "California", city: "San Francisco" },
    body: [
      "For the last fifteen years the dominant logic of consumer software has been accumulation. Add a feed. Add a marketplace. Add payments, then video, then AI. The end state of every app, eventually, was every app.",
      "That logic is starting to crack. Users are tiring of bundles they did not ask for; regulators are tiring of conglomerates they cannot supervise; designers are tiring of homepages that have to please everyone.",
      "The next decade may belong to small, opinionated tools that do exactly one thing — and have the good manners to leave when they are done.",
    ],
  },
  {
    slug: "marrakech-after-dark",
    title: "Marrakech after dark: a night-walker's guide to the medina",
    excerpt: "A poet, a pastry chef and a taxi driver walk into a riad. Notes from forty-eight hours of staying up too late.",
    category: "travel",
    author: "Yasmine El Idrissi",
    date: "2026-04-04",
    readingMinutes: 7,
    image: catTravel,
    imageAlt: "Sunset over the Marrakech medina with hanging lanterns",
    geo: { country: "Morocco", region: "Marrakech-Safi", city: "Marrakech" },
    body: [
      "If you have only seen Marrakech in daylight you have only seen half of it. The other half — the half locals quietly prefer — begins around the time the muezzin calls for the fourth prayer and the city, suddenly cooler, opens its second eye.",
      "On my first night I followed a poet from a mint-tea bar to a hidden courtyard where a woman was selling honey pastries off a folding table. On my second night I followed the smell of charcoal to a small alley where five men were grilling sardines and arguing politely about football.",
      "Bring small notes. Bring better shoes than you think you need. Bring nothing important to do tomorrow.",
    ],
  },
  {
    slug: "what-museums-keep-getting-wrong",
    title: "What museums keep getting wrong about young visitors",
    excerpt: "It isn't the lighting. It isn't the gift shop. It's the building's idea of what attention is supposed to look like.",
    category: "culture",
    author: "Tomás Vidal",
    date: "2026-03-29",
    readingMinutes: 6,
    image: catCulture,
    imageAlt: "A magenta gallery wall with a single illuminated painting",
    geo: { country: "Spain", region: "Catalonia", city: "Barcelona" },
    body: [
      "Every six months a museum somewhere announces a campaign to attract younger visitors. The campaign almost always involves a TikTok account, a slightly cheaper ticket, and an installation in the lobby that lights up when you wave at it.",
      "The problem is rarely the marketing. The problem is the building's quiet insistence that the right way to look at a painting is in silence, alone, for exactly the length of time the wall text suggests.",
      "Younger visitors are not refusing to pay attention. They are refusing to pay attention in the particular shape museums have been asking them to. The museums that have understood this — quietly redesigning their galleries for conversation, for sitting, for coming back twice — are filling up.",
    ],
  },
];

export function articlesByCategory(slug: CategorySlug): Article[] {
  return ARTICLES.filter((a) => a.category === slug);
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function latestArticles(limit = 6): Article[] {
  return [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

export function featuredArticle(): Article {
  return ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
}
