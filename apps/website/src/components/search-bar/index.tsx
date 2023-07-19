"use client";
import { useCallback, useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import classes from "./SearchBar.module.css";
import { apiClient } from "src/util/api-client";
import type { Sound } from "@fukumong/database";
export interface SearchBarProps {
  onChange?(value: string): void;
}

function postSong(sound: Partial<Sound>) {
  const data = Object.entries(sound).reduce((data, [key, value]) => {
    data.append(key, value as any);
    return data;
  }, new FormData());
  return apiClient().post("/sounds", data);
}

export function SearchBar({ onChange }: SearchBarProps) {
  const [search, setSearch] = useState("");

  const handler = useCallback(
    (e: any) => {
      e.preventDefault();
      if (/^https?:\/\//.test(search)) {
        setSearch("");
        postSong({ source: search }).then(() => location.reload());
      }
    },
    [search],
  );

  return (
    <div className={classes.wrapper}>
      <form className={classes.searchContainer} onSubmit={handler}>
        <input
          type="search"
          size={1}
          value={search}
          className={classes.searchInput}
          onChange={ev => {
            onChange?.(ev.currentTarget.value);
            setSearch(ev.currentTarget.value);
          }}
        />
        <button
          type="submit"
          className={classes.searchButton}
          tabIndex={-1}
          onClick={handler}>
          <MdSearch />
        </button>
      </form>
    </div>
  );
}
