import { Pagination } from "src/components/pagination";
import { SearchBar } from "src/components/search-bar";
import { SoundCard } from "src/components/sound-card";
import { apiServer } from "src/util/api-server";
import type { Sound } from "@fukumong/database";

export default async function MusicPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  let page = parseInt(String(searchParams.page) ?? "1", 10) - 1;
  if (!Number.isFinite(page)) page = 0;
  const { items: songs, pages } = await apiServer()
    .get("/sounds", {
      params: { page },
    })
    .then(it => it.data);

  return (
    <>
      <SearchBar />
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 container mx-auto px-4">
        {songs.map((song: Sound) => (
          <SoundCard
            title={song.title}
            artist={song.artist}
            length={song.length}
            tags={song.tags}
            thumbnail={song.thumbnail}
            key={song.id}
            id={song.id}
          />
        ))}
      </div>
      <div className="mx-auto py-4">
        <Pagination pages={pages} current={page} />
      </div>
    </>
  );
}
