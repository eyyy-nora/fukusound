import type { Playlist } from "@fukumong/database";
import { Pagination } from "src/components/pagination";
import { SearchBar } from "src/components/search-bar";
import { PlaylistCard } from "src/components/playlist-card";
import { apiServer } from "src/util/api-server";

export default async function PlaylistsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  let page = parseInt(String(searchParams.page) ?? "1", 10) - 1;
  if (!Number.isFinite(page)) page = 0;
  const { items: playlists, pages } = await apiServer()
    .get("/playlists", {
      params: { page },
    })
    .then(it => it.data);

  return (
    <>
      <SearchBar />
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 container mx-auto px-4">
        {playlists.map((playlist: Playlist) => (
          <PlaylistCard
            key={playlist.id}
            name={playlist.name}
            id={playlist.id}
            songs={playlist.sounds.slice(0, 5)}
            count={playlist.sounds.length}
          />
        ))}
      </div>
      <div className="mx-auto py-4">
        <Pagination pages={pages} current={page} />
      </div>
    </>
  );
}
