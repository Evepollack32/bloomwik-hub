import { LOCALE_CODES } from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LocaleProvider } from "@/lib/locale-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Toaster } from "@/components/ui/sonner";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { getPublicSettings, DEFAULT_SETTINGS, type CustomMetaTag } from "@/lib/engagement.functions";


function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ruby">404</p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The story you're looking for has wandered off the map.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-[20px] bg-navy px-5 py-2.5 text-sm font-medium text-champagne transition hover:bg-amethyst"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-foreground">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">{friendlyErrorMessage(error, "public")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-[20px] bg-navy px-5 py-2.5 text-sm font-medium text-champagne hover:bg-amethyst"
          >Try again</button>
          <a href="/" className="rounded-[20px] border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      return { settings: await getPublicSettings() };
    } catch {
      return { settings: DEFAULT_SETTINGS };
    }
  },
  head: ({ loaderData }) => {
    const s = { ...DEFAULT_SETTINGS, ...(loaderData?.settings ?? {}) };
    const siteName = s.site_name || "Bloomwik Hub";
    const title = s.tagline ? `${siteName} — ${s.tagline}` : siteName;
    const description =
      s.description ||
      "An editorial blog covering travel, fashion, food, technology and culture — translated into 15 languages.";
    const ogImage =
      s.default_og_image ||
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3071fcf8-8dd9-4c60-a023-b882fc812844/id-preview-335d3506--d34f12e6-7842-4091-b787-15c7904efe7a.lovable.app-1778752731639.png";
    const custom = ((s.custom_meta ?? []) as CustomMetaTag[]).filter((m) => m?.key && m?.value);

    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: siteName },
      { name: "theme-color", content: "#0A192F" },
      ...(s.default_keywords ? [{ name: "keywords", content: s.default_keywords }] : []),
      ...(s.google_site_verification ? [{ name: "google-site-verification", content: s.google_site_verification }] : []),
      ...(s.bing_site_verification ? [{ name: "msvalidate.01", content: s.bing_site_verification }] : []),
      ...(s.yandex_site_verification ? [{ name: "yandex-verification", content: s.yandex_site_verification }] : []),
      ...(s.pinterest_site_verification ? [{ name: "p:domain_verify", content: s.pinterest_site_verification }] : []),
      ...(s.facebook_domain_verification ? [{ name: "facebook-domain-verification", content: s.facebook_domain_verification }] : []),
      ...custom.map((m) =>
        m.kind === "property"
          ? { property: m.key, content: m.value }
          : m.kind === "http-equiv"
            ? { httpEquiv: m.key, content: m.value }
            : { name: m.key, content: m.value },
      ),
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: s.twitter_handle || "@bloomwikhub" },
      // GEO defaults; overridden per-article
      { name: "geo.region", content: "US" },
      { name: "geo.placename", content: "Worldwide" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: "/",
          inLanguage: LOCALE_CODES as string[],
          potentialAction: {
            "@type": "SearchAction",
            target: "/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <div className="flex min-h-screen flex-col">
          <PageViewTracker />
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
