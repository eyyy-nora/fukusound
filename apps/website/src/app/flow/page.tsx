"use client";
import clsx from "clsx";
import { MdOutlineBolt, MdTag } from "react-icons/md";
import {
  Connection,
  useViewportContext,
  Viewport,
} from "src/app/flow/viewport";
import classes from "./flow.module.css";

function ConnectionPoint({
  connection,
  constant,
  end = false,
}: {
  connection?: Connection;
  constant?: boolean;
  end?: boolean;
}) {
  const { useConnection } = useViewportContext();

  return (
    <div
      ref={useConnection(connection, end)}
      style={{ "--connection-color": connection?.color }}
      className={clsx({
        [classes.connectionPoint]: true,
        [classes.active]: !!connection,
        [classes.constant]: constant,
      })}
    />
  );
}

interface NodeOption {
  name: string;
  type: string;
  connected?: Connection;
  constant?: boolean;
  value?: any;
}

const prevent = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};

function EventNode({ name, out }: { name: string; out: NodeOption[] }) {
  return (
    <article
      onMouseDown={prevent}
      className="relative bg-zinc-700 border-2 border-zinc-500 rounded-l-full rounded-r-lg shadow-lg max-w-xs text-slate-300 min-h-[80px] hover:border-zinc-400 focus:bg-zinc-600 transition select-none flex flex-row items-center justify-between pl-4 py-2 cursor-move">
      <div className="font-semibold flex flex-row items-center py-1 px-2">
        <span className="w-6 text-xl flex-grow-0 flex-shrink-0">
          <MdOutlineBolt />
        </span>
        <span className="flex-grow flex-shrink text-base truncate">{name}</span>
      </div>
      <div className="flex flex-col items-end -mr-2 gap-1 text-sm">
        {out.map(option => (
          <div className="flex flex-row items-center gap-2" key={option.name}>
            <span className="">{option.name}</span>
            <ConnectionPoint connection={option.connected} />
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Flow() {
  return (
    <div className="bg-zinc-800 overflow-hidden flex flex-col gap-4">
      <div className="h-screen w-screen">
        <Viewport>
          <foreignObject x={-250} y={-21} width={1000} height={1000}>
            <EventNode
              name="End of Turn"
              out={[
                {
                  name: "player",
                  type: "Player",
                  connected: { id: "1", color: "210,79,114" },
                },
                {
                  name: "party",
                  type: "Party",
                },
                {
                  name: "turn",
                  type: "int",
                },
              ]}
            />
          </foreignObject>
          <foreignObject x={298} y={79 - 55} width={1000} height={1000}>
            <article className="relative bg-zinc-700 border-2 border-zinc-500 rounded-lg shadow-lg max-w-xs mx-2 text-slate-300 min-h-[80px] hover:border-zinc-400 focus:bg-zinc-600 transition select-none pb-2 cursor-move">
              <div className="font-semibold flex flex-row items-center py-2 px-2">
                <span className="w-6 text-xl flex-grow-0 flex-shrink-0">
                  <MdTag />
                </span>
                <span className="flex-grow flex-shrink text-base truncate">
                  Hello World
                </span>
              </div>
              <div className="relative flex flex-row justify-between items-center gap-12">
                <div className="flex flex-col -ml-2 gap-1 text-sm">
                  <div className="flex flex-row items-center gap-2">
                    <ConnectionPoint constant />
                    <span className="">time</span>
                    <input
                      className="px-0.5 text-center bg-zinc-800 bg-opacity-25 hover:bg-opacity-50 focus:bg-opacity-75 outline-none ring-0 border-0 rounded"
                      defaultValue="12:45"
                      size={1}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <ConnectionPoint
                      connection={{ id: "1", color: "210,79,114" }}
                      end
                    />
                    <span className="">player</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <ConnectionPoint />
                    <span className="">text?</span>
                  </div>
                </div>
                <div className="flex flex-col items-end -mr-2 gap-1 text-sm">
                  <div className="flex flex-row items-center gap-2">
                    <span className="">id</span>
                    <ConnectionPoint />
                  </div>
                </div>
              </div>
            </article>
          </foreignObject>
        </Viewport>
      </div>
    </div>
  );
}
