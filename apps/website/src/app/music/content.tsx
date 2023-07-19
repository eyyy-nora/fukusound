"use client";
import { useCallback, useState } from "react";
import { Pagination } from "src/components/pagination";
import { SearchBar } from "src/components/search-bar";
import { SoundCard } from "src/components/sound-card";
import { apiClient } from "src/util/api-client";
import type { Sound } from "@fukumong/database";

export function MusicPageContent({
  data: initial,
}: {
  data: {
    items: Sound[];
    page: number;
    pageSize: number;
    pages: number;
  };
}) {
  const [data, setData] = useState(initial);

  const handleSearch = useCallback(
    (search: string) => {
      apiClient()
        .get("/sounds", {
          params: { pageSize: data.pageSize, search: search || undefined },
        })
        .then(it => setData(it.data));
    },
    [data.pageSize],
  );

  return (
    <>
      <SearchBar onChange={handleSearch} />
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 container mx-auto px-4">
        {data.items.map((song: Sound) => (
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
        <Pagination pages={data.pages} current={data.page} />
      </div>
    </>
  );
}
