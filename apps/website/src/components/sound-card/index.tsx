"use client";
import Link from "next/link";
import { MdOutlinePlayArrow } from "react-icons/md";
import { useMediaContext } from "src/context/media-context";
import { formatTime } from "src/util/time";
import classes from "./sound-card.module.css";
export interface SoundCardProps {
  thumbnail?: string;
  artist?: string;
  title?: string;
  tags?: string[];
  length?: number;
  id: number;
  playlist?: string;
}

export function SoundCard({
  thumbnail = "/music-placeholder.png",
  artist = "--",
  title = "--",
  tags = [],
  length = 0,
  id,
  playlist,
}: SoundCardProps) {
  const { actions } = useMediaContext();

  return (
    <article className={classes.soundCard}>
      <div className={classes.thumbnailSection}>
        <img src={thumbnail} alt="" className={classes.thumbnail} />
        <span className={classes.length}>{formatTime(length)}</span>
      </div>
      <div className={classes.metadataSection}>
        <strong className={classes.title}>{title}</strong>
        <span className={classes.artist}>{artist}</span>
        <span className={classes.tags}>
          {tags?.map(tag => (
            <Link href={`?tag=${encodeURIComponent(tag)}`} key={tag}>
              #{tag}
            </Link>
          ))}
        </span>
      </div>
      <div className={classes.sep} />
      <div className={classes.actionSection}>
        <button
          className={classes.action}
          onClick={ev => {
            if (ev.ctrlKey || ev.shiftKey) actions.queue(id, playlist);
            else actions.play(id, playlist);
          }}>
          <MdOutlinePlayArrow />
        </button>
      </div>
    </article>
  );
}
