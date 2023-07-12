"use client";
import { MouseEvent, useState, WheelEvent } from "react";
import {
  MdDeleteOutline,
  MdPause,
  MdPlayArrow,
  MdPlaylistPlay,
  MdRepeat,
  MdRepeatOne,
  MdSave,
  MdShuffle,
  MdSkipNext,
  MdSkipPrevious,
  MdVolumeDown,
  MdVolumeMute,
  MdVolumeUp,
} from "react-icons/md";
import { useMediaContext } from "src/context/media-context";
import { formatTime } from "src/util/time";
import classes from "./music-seeker-bar.module.css";
import clsx from "clsx";
export type RepeatState = "none" | "one" | "all";

export function MusicSeekerBar() {
  const { state, actions } = useMediaContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Queue");

  function handleVolumeMouseDown(evt: MouseEvent<HTMLDivElement>) {
    const { top, height } = evt.currentTarget.getBoundingClientRect();
    const value = 1 - (evt.clientY - top) / height;
    actions.setVolume(Math.round(value * 20) * 0.05);
    evt.preventDefault();
  }

  function handleVolumeWheel(evt: WheelEvent<HTMLButtonElement>) {
    const step = evt.deltaY > 0 ? -0.05 : 0.05;
    actions.setVolume(state.volume + step);
    evt.preventDefault();
  }

  const repeatLabel = {
    all: "repeat one",
    one: "repeat off",
    none: "repeat all",
  }[state.repeat as RepeatState];
  const shuffleLabel = state.shuffle ? "shuffle off" : "shuffle on";
  const playLabel = state.state === "paused" ? "play" : "pause";

  const formatCurrent = state.length === -1 ? "--:--" : formatTime(state.time);
  const formatTotal = state.length === -1 ? "--:--" : formatTime(state.length);

  return (
    <div className={classes.musicSeekerBar}>
      <div className={classes.metadata}>
        <img
          src={state.thumbnail ?? "/music-placeholder.png"}
          alt=""
          className={classes.thumbnail}
        />
        <div className={classes.info}>
          <strong className={classes.title}>{state.title}</strong>
          <span className={classes.artist}>{state.artist}</span>
        </div>
      </div>
      <button
        className={clsx(classes.toggleQueue, open && classes.toggleActive)}
        onClick={() => setOpen(open => !open)}>
        <MdPlaylistPlay />
      </button>

      <div className={clsx(classes.queue, open && classes.open)}>
        <header className={classes.queueHeader}>
          <input
            defaultValue={title}
            placeholder="Queue"
            className={classes.queueTitle}
            onChange={ev => setTitle(ev.currentTarget.value)}
          />
          <button
            className={classes.queueSave}
            onClick={() => actions.saveQueue(title)}>
            <MdSave />
          </button>
        </header>
        {state.queue.map((song, index) => (
          <div
            key={`${song.id} - ${index}`}
            className={clsx(
              classes.queueEntry,
              state.index === index && classes.queueActive,
            )}>
            <button
              className={classes.queueListButton}
              onClick={() => actions.skipTo(index)}>
              <img
                src={song.thumbnail ?? "/music-placeholder.png"}
                alt=""
                className={classes.queueThumbnail}
              />
              <div className={classes.queueMeta}>
                <span>{song.title}</span>
                <span>{song.artist}</span>
              </div>
            </button>
            <div className={classes.queueTime}>{formatTime(song.length)}</div>
            <div className={classes.queueActions}>
              <button
                onClick={e => {
                  e.preventDefault();
                  actions.unqueue(index);
                }}>
                <MdDeleteOutline />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={classes.seeker}>
        <span className={classes.timePlayed}>{formatCurrent}</span>
        <div className={classes.progressBar}>
          <div
            className={classes.progress}
            style={
              {
                "--progress":
                  state.length === -1 ? 0 : state.time / state.length,
              } as any
            }
          />
        </div>
        <span className={classes.duration}>{formatTotal}</span>
      </div>

      <div className={classes.controls}>
        <button
          className={classes.controlVolume}
          aria-label={state.volume > 0 ? "mute" : "unmute"}
          onWheel={handleVolumeWheel}>
          <div className={classes.volumePopover}>
            <div
              className={classes.volumeSlider}
              onMouseDown={handleVolumeMouseDown}>
              <div
                className={classes.volumeSliderFill}
                style={{ "--volume": state.volume } as any}
              />
            </div>
            <span className={classes.volumeDisplay}>
              {Math.floor(state.volume * 100)}
            </span>
          </div>
          {state.volume === 0 ? (
            <MdVolumeMute />
          ) : state.volume < 0.5 ? (
            <MdVolumeDown />
          ) : (
            <MdVolumeUp />
          )}
        </button>
        <div className={classes.controlSeparator} />
        <button
          className={classes.controlRepeat}
          aria-label={repeatLabel}
          onClick={actions.toggleRepeat}>
          {state.repeat === "none" ? (
            <MdRepeat className="opacity-50" />
          ) : state.repeat === "all" ? (
            <MdRepeat />
          ) : (
            <MdRepeatOne />
          )}
        </button>
        <div className={classes.controlSeparator} />
        <button
          className={classes.controlPrev}
          aria-label="previous track"
          onClick={actions.skipBackward}>
          <MdSkipPrevious />
        </button>
        <button
          className={classes.controlPlay}
          aria-label={playLabel}
          onClick={state.state === "playing" ? actions.pause : actions.resume}>
          {state.state === "playing" ? <MdPause /> : <MdPlayArrow />}
        </button>
        <button
          className={classes.controlNext}
          aria-label="skip track"
          onClick={actions.skipForward}>
          <MdSkipNext />
        </button>
        <div className={classes.controlSeparator} />
        <button
          className={classes.controlShuffle}
          aria-label={shuffleLabel}
          onClick={actions.toggleShuffle}>
          <MdShuffle className={!state.shuffle ? "opacity-50" : ""} />
        </button>
      </div>
    </div>
  );
}
