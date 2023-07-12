"use client";
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
  return (
    <div className={classes.wrapper}>
      <div className={classes.searchContainer}>
        <input
          type="search"
          size={1}
          className={classes.searchInput}
          onChange={ev => props.onChange?.(ev.currentTarget.value)}
        />
        <button
          type="submit"
          className={classes.searchButton}
          tabIndex={-1}
          onClick={() =>
            postSong({
              source: "https://www.youtube.com/watch?v=iatQIC2LiyY",
            })
          }>
          <MdSearch />
        </button>
      </div>
    </div>
  );
}
