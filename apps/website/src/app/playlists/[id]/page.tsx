import { Sound } from "@fukumong/database";
import { Pagination } from "src/components/pagination";
import { SoundCard } from "src/components/sound-card";
import { apiServer } from "src/util/api-server";

export default async function PlaylistPage({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>;
  params: Record<string, string>;
}) {
  let page = parseInt(String(searchParams.page) ?? "1", 10) - 1;
  if (!Number.isFinite(page)) page = 0;
  const { items: songs, pages } = await apiServer()
    .get("/sounds", {
      params: { page, playlist: params.id },
    })
    .then(it => it.data);

  return (
    <>
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 container mx-auto px-4 mt-12">
        {songs.map((song: Sound) => (
          <SoundCard
            title={song.title}
            artist={song.artist}
            length={song.length}
            tags={song.tags}
            thumbnail={song.thumbnail}
            key={song.id}
            id={song.id}
            playlist={params.id}
          />
        ))}
      </div>
      <div className="mx-auto py-4">
        <Pagination pages={pages} current={page} />
      </div>
    </>
  );
}
