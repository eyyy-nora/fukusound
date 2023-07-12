import { Pagination } from "src/components/pagination";
import { SearchBar } from "src/components/search-bar";

export default async function EffectsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  let page = parseInt(String(searchParams.page) ?? "1", 10) - 1;
  if (!Number.isFinite(page)) page = 0;
  const pages = 3;

  return (
    <>
      <SearchBar />
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 container mx-auto px-4">
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
        <div className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 h-48 rounded-lg shadow-lg">
          Hello World
        </div>
      </div>
      <div className="mx-auto py-4">
        <Pagination pages={pages} current={page} />
      </div>
    </>
  );
}
