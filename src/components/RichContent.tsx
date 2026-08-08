import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

const ALLOWED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
];

function sanitize(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe", "figure", "figcaption", "colgroup", "col"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "target",
      "rel",
      "colspan",
      "rowspan",
      "colwidth",
      "start",
      "style",
    ],
  });

  // Drop any iframe that isn't a known video provider.
  if (typeof document === "undefined") return clean;
  const holder = document.createElement("div");
  holder.innerHTML = clean;
  holder.querySelectorAll("iframe").forEach((frame) => {
    try {
      const host = new URL(frame.getAttribute("src") ?? "", "https://x.invalid").hostname;
      if (!ALLOWED_IFRAME_HOSTS.includes(host)) frame.remove();
      else frame.setAttribute("allowfullscreen", "");
    } catch {
      frame.remove();
    }
  });
  return holder.innerHTML;
}

/** Renders sanitized article HTML (lists, tables, images, embedded video). */
export function RichContent({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => sanitize(html), [html]);
  return (
    <div
      className={className ?? "prose-blog max-w-none text-foreground"}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
