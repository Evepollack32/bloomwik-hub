import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * IndexNow key verification file: https://<site>/<key>.txt must return the key.
 */
export const Route = createFileRoute("/$indexnowKey.txt")({
  server: {
    handlers: {
      GET: async ({ params }: { params: Record<string, string> }) => {
        const requested = (params.indexnowKey ?? "").replace(/\.txt$/i, "");
        const { data } = await supabaseAdmin
          .from("site_settings")
          .select("value")
          .eq("key", "general")
          .maybeSingle();
        const key = String(((data as any)?.value?.indexnow_key ?? "")).trim();
        if (!key || key !== requested) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(key, {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
