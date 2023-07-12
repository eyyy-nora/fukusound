import axios, { AxiosInstance } from "axios";
import { createContext, useContext, useMemo, useState } from "react";
import { apiClient } from "src/util/api-client";
import type { Sound } from "@fukumong/database";

export type RepeatState = "none" | "one" | "all";

export interface NowPlaying {
  title?: string;
  artist?: string;
  thumbnail?: string;

  time: number;
  length: number;
  state: "playing" | "paused";
  volume: number;

  shuffle: boolean;
  repeat: RepeatState;
  index: number;
  queue: Sound[];
}

export interface MediaMethods {
  play(id: number, playlist?: number): Promise<void>;
  queue(id: number, playlist?: number): Promise<void>;
  unqueue(index: number): Promise<void>;
  saveQueue(name: string): Promise<void>;

  pause(): Promise<void>;
  resume(): Promise<void>;
  skipForward(): Promise<void>;
  skipBackward(): Promise<void>;
  skipTo(index: number): Promise<void>;

  setVolume(volume: number): Promise<void>;
  toggleShuffle(): Promise<void>;
  toggleRepeat(): Promise<void>;
}

export interface MediaContext {
  state: NowPlaying;
  actions: MediaMethods;
  client: AxiosInstance;
}

const throws = (msg: string) => () => {
  throw new Error(msg);
};
const notSupported = throws("Needs to be called inside MediaContext");
const emptyState: NowPlaying = {
  time: 0,
  length: -1,
  state: "paused",
  volume: 0.4,
  shuffle: false,
  repeat: "none",
  index: -1,
  queue: [],
};

const context = createContext<MediaContext>({
  state: emptyState,
  actions: {
    play: notSupported,
    queue: notSupported,
    unqueue: notSupported,
    saveQueue: notSupported,
    pause: notSupported,
    resume: notSupported,
    setVolume: notSupported,
    toggleRepeat: notSupported,
    toggleShuffle: notSupported,
    skipForward: notSupported,
    skipBackward: notSupported,
    skipTo: notSupported,
  },
  client: axios.create(),
});
context.displayName = "MediaContext";

export function useMediaContext() {
  return useContext(context);
}

export function MediaContextProvider({
  children,
  initial,
}: {
  children: any;
  initial?: NowPlaying;
}) {
  const [state, setState] = useState(() => initial ?? emptyState);
  const client = useMemo(apiClient, []);
  const actions = useMemo<MediaMethods>(() => {
    return {
      async toggleShuffle() {
        await client
          .post(`/media/settings?shuffle=${!state.shuffle}`)
          .then(({ data }) => setState(data));
      },
      async setVolume(volume: number) {
        volume = Math.min(1, Math.max(0, volume));
        if (volume === state.volume) return;
        await client
          .post(`/media/settings?volume=${volume.toFixed(2)}`)
          .then(({ data }) => setState(data));
      },
      async toggleRepeat() {
        const nextRepeat = {
          none: "all",
          all: "one",
          one: "none",
        }[state.repeat];
        await client
          .post(`/media/settings?repeat=${nextRepeat}`)
          .then(({ data }) => setState(data));
      },
      async pause() {
        await client.post(`/media/pause`).then(({ data }) => setState(data));
      },
      async resume() {
        await client.post(`/media/resume`).then(({ data }) => setState(data));
      },
      async play(id: number, playlist?: number) {
        if (playlist != null)
          await client
            .post(`/media/play-playlist/${playlist}?songId=${id}`)
            .then(({ data }) => setState(data));
        else
          await client
            .post(`/media/play/${id}`)
            .then(({ data }) => setState(data));
      },
      async queue(id: number, playlist?: number) {
        if (playlist != null)
          await client
            .post(`/media/queue-playlist/${playlist}?songId=${id}`)
            .then(({ data }) => setState(data));
        else
          await client
            .post(`/media/queue/${id}`)
            .then(({ data }) => setState(data));
      },
      async unqueue(index: number) {
        await client
          .post(`/media/unqueue/${index}`)
          .then(({ data }) => setState(data));
      },
      async saveQueue(name: string) {
        await client.post(`/media/save-queue?name=${name}`);
      },
      async skipForward() {
        await client
          .post(`/media/skip-forward`)
          .then(({ data }) => setState(data));
      },
      async skipBackward() {
        await client
          .post(`/media/skip-backward`)
          .then(({ data }) => setState(data));
      },
      async skipTo(index: number) {
        await client
          .post(`/media/skip-to/${index}`)
          .then(({ data }) => setState(data));
      },
    };
  }, [client, state]);
  const value = useMemo(
    () => ({ actions, state, client }),
    [actions, state, client],
  );
  return <context.Provider value={value}>{children}</context.Provider>;
}
