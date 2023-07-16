"use client";
import { useState } from "react";
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
  return apiClient().post("/sound", data);
}

export function SearchBar(props: SearchBarProps) {
  const [search, setSearch] = useState("");

  return (
    <div className={classes.wrapper}>
      <form
        className={classes.searchContainer}
        onSubmit={e => {
          e.preventDefault();
          postSong({
            source: search,
          }).then(() => location.reload());
        }}>
        <input
          type="search"
          size={1}
          value={search}
          className={classes.searchInput}
          onChange={ev => {
            props.onChange?.(ev.currentTarget.value);
            setSearch(ev.currentTarget.value);
          }}
        />
        <button
          type="submit"
          className={classes.searchButton}
          tabIndex={-1}
          onClick={() =>
            postSong({
              source: search,
            }).then(() => location.reload())
          }>
          <MdSearch />
        </button>
      </form>
    </div>
  );
}
