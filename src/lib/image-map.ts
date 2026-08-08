// Maps stable seed paths (`/src/assets/<file>.jpg`) to the bundler-resolved URLs.
// Admin uploads go to Supabase Storage and are stored as full https:// URLs,
// which pass through `resolveImage` unchanged.
import featuredTravel from "@/assets/featured-travel.jpg";
import catTravel from "@/assets/cat-travel.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catFood from "@/assets/cat-food.jpg";
import catTechnology from "@/assets/cat-technology.jpg";
import catCulture from "@/assets/cat-culture.jpg";

const MAP: Record<string, string> = {
  "/src/assets/featured-travel.jpg": featuredTravel,
  "/src/assets/cat-travel.jpg": catTravel,
  "/src/assets/cat-fashion.jpg": catFashion,
  "/src/assets/cat-food.jpg": catFood,
  "/src/assets/cat-technology.jpg": catTechnology,
  "/src/assets/cat-culture.jpg": catCulture,
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 12'><rect width='16' height='12' fill='%23F5E6D3'/></svg>`
  );

export function resolveImage(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER;
  return MAP[url] ?? url;
}
