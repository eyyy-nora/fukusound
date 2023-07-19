import { MusicPageContent } from "src/app/music/content";
import { apiServer } from "src/util/api-server";

export default async function MusicPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  let page = parseInt(String(searchParams.page) ?? "1", 10) - 1;
  if (!Number.isFinite(page)) page = 0;
  const data = await apiServer()
    .get("/sounds", {
      params: { page },
    })
    .then(it => it.data);

  return <MusicPageContent data={data} />;
}
