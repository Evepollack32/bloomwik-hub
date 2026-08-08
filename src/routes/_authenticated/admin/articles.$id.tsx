import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetArticle } from "@/lib/blog.functions";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/_authenticated/admin/articles/$id")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const get = useServerFn(adminGetArticle);
  const { data, isLoading } = useQuery({ queryKey: ["adminArticle", id], queryFn: () => get({ data: { id } }) });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return <p>Not found.</p>;
  return <ArticleEditor article={data.article} translations={data.translations} />;

}
