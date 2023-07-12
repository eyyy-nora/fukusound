"use client";
import { ReactNode } from "react";
import { MusicSeekerBar } from "src/components/music-seeker-bar";
import { Navigation } from "src/components/navigation";
import { MediaContextProvider, NowPlaying } from "src/context/media-context";

export interface UserInfo {
  name: string;
  discordId: string;
  avatar: string;
}

export async function Layout({
  children,
  state,
  user,
}: {
  children: ReactNode;
  state?: NowPlaying;
  user?: UserInfo;
}) {
  return (
    <main className="flex flex-col w-screen h-screen overflow-hidden">
      <MediaContextProvider initial={state}>
        <Navigation extra={[]} user={user} />
        <div className="flex flex-1 flex-grow flex-shrink flex-row">
          <div className="bg-zinc-900 flex-grow text-slate-400 flex flex-col relative">
            {children}
            <div className="flex-grow"></div>
            <MusicSeekerBar />
          </div>
        </div>
      </MediaContextProvider>
    </main>
  );
}
