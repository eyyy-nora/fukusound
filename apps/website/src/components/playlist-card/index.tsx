"use client";
import { MdDeleteOutline, MdOutlinePlayArrow, MdRemove } from "react-icons/md";
import { useMediaContext } from "src/context/media-context";
import { apiClient } from "src/util/api-client";
import classes from "./playlist-card.module.css";
import Link from "next/link";
import { formatTime } from "src/util/time";

export interface PlaylistCardProps {
  name: string;
  id: number;
  count: number;
  songs: {
    id: number;
    thumbnail?: string;
    length: number;
  }[];
}

function prevent<T extends { preventDefault(): void }>(
  handler: (ev: T) => void | Promise<void>,
) {
  return (e: T) => {
    e.preventDefault();
    handler(e);
  };
}

export function PlaylistCard({ name, id, count, songs }: PlaylistCardProps) {
  const { actions } = useMediaContext();
  return (
    <Link href={`/playlists/${id}`}>
      <article className={classes.playlistCard}>
        <header className={classes.header}>
          <div className={classes.meta}>
            <h2 className={classes.title}>{name}</h2>
            <span className={classes.count}>{count} songs</span>
          </div>
          <div className={classes.actions}>
            <button
              onClick={prevent(() => {
                apiClient().delete(`/playlists/${id}`).then();
              })}>
              <MdDeleteOutline />
            </button>
            <button
              onClick={prevent(() => {
                actions.play(undefined as any, id).then();
              })}>
              <MdOutlinePlayArrow />
            </button>
          </div>
        </header>
        <div className={classes.songs}>
          {songs.map(song => {
            return (
              <div key={song.id} className={classes.song}>
                <img
                  src={song.thumbnail ?? "/music-placeholder.png"}
                  alt=""
                  className={classes.thumbnail}
                />
                <span className={classes.songLength}>
                  {song?.length && formatTime(song.length)}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </Link>
  );
}
