/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  useCallback,
  useState,
  WheelEvent,
  MouseEvent,
  PointerEvent,
  createContext,
  useMemo,
  useContext,
} from "react";

function deltas(
  e: MouseEvent<SVGElement> | WheelEvent<SVGElement> | PointerEvent<SVGElement>,
): Coords {
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  const mx = (e.clientX - rect.x) / rect.width;
  const my = (e.clientY - rect.y) / rect.height;
  return [mx, my];
}

function offset(svg: SVGElement, el: HTMLElement | SVGElement): Coords {
  const svgRect = svg.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return [
    (elRect.x + elRect.width / 2) / svgRect.width,
    (elRect.y + elRect.height / 2) / svgRect.height,
  ];
}

function scaled([x, y, w, h]: ViewBox, [mx, my]: Coords, scale = 1): ViewBox {
  const nx = x - w * (scale - 1) * mx;
  const ny = y - h * (scale - 1) * my;
  const nw = w * scale;
  const nh = h * scale;
  return [nx, ny, nw, nh];
}

type ViewBox = [x: number, y: number, w: number, h: number];
type Coords = [x: number, y: number];

export interface Connection {
  id: string;
  start?: ConnectionNode;
  end?: ConnectionNode;
  color: string;
}

interface ConnectionNode {
  el?: HTMLElement | SVGElement;
  pos?: Coords;
}

const context = createContext({
  connections: [
    {
      id: "1",
      color: "210,79,114",
    },
  ] as Connection[],
  defineConnection(connection: Connection): void {
    throw new Error("no");
  },
  useConnection(
    connection: Connection | undefined,
    end: boolean,
  ): (el: any) => void {
    throw new Error("no");
  },
});

export function useViewportContext() {
  return useContext(context);
}

export function Viewport({ children }: { children: any }) {
  const [viewBox, setViewBox] = useState<ViewBox>([0, 0, 0, 0]);
  const [drag, setDrag] = useState<Coords | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [svg, setSvg] = useState<SVGElement | null>(null);

  const handleWheel = useCallback(function handleWheel(
    e: WheelEvent<SVGElement>,
  ) {
    const delta = deltas(e);
    const scale = 1 + Math.sign(e.deltaY) * 0.05;
    setViewBox(viewBox => scaled(viewBox, delta, scale));
    setDrag(drag => drag && delta);
  },
  []);

  const handleMouseDown = useCallback((e: MouseEvent<SVGElement>) => {
    e.preventDefault();
    setDrag(deltas(e));
  }, []);

  const handleMouseMove = useCallback(
    function handleMouseMove(e: MouseEvent<SVGElement>) {
      if (!drag) return;
      e.preventDefault();
      const delta = deltas(e);
      const [dx, dy] = [drag[0] - delta[0], drag[1] - delta[1]];
      setViewBox(([x, y, w, h]) => {
        return [x + dx * w, y + dy * h, w, h];
      });
      setDrag(delta);
    },
    [drag],
  );

  const handleMouseUp = useCallback(() => {
    setDrag(null);
  }, []);

  const ref = useCallback((el: SVGElement | null) => {
    setSvg(el);
    if (!el) return;
    setViewBox([
      0 - el.clientWidth / 2,
      0 - el.clientHeight / 2,
      el.clientWidth,
      el.clientHeight,
    ]);
  }, []);

  const defineConnection = useCallback((connection: Connection) => {
    setConnections(connections => {
      const index = connections.findIndex(it => it.id === connection.id);
      if (index === -1) return [...connections, connection];
      const copy = connections.slice();
      copy.splice(index, 1, { ...connections[index], ...connection });
      return copy;
    });
  }, []);

  const useConnection = useCallback(
    (connection: Connection | undefined, end: boolean) => {
      return useCallback(
        (el: any) => {
          if (!el || !connection || !svg) return;
          const pos = offset(svg, el).map((n, i) =>
            Math.round(viewBox[i] + n * viewBox[i + 2]),
          ) as Coords;
          if (end) connection.end = { el, pos };
          else connection.start = { el, pos };

          setConnections(connections => {
            const index = connections.findIndex(it => it.id === connection.id);
            if (index === -1) return [...connections, connection];
            const copy = connections.slice();
            copy.splice(index, 1, { ...connections[index], ...connection });
            return copy;
          });
        },
        [connection, end, viewBox],
      );
    },
    [svg, viewBox],
  );

  const value = useMemo(
    () => ({
      connections,
      defineConnection,
      useConnection,
    }),
    [connections, defineConnection, useConnection],
  );

  return (
    <svg
      ref={ref}
      viewBox={`${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`}
      className="w-full h-full cursor-crosshair"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}>
      {connections
        .filter(it => it.start?.pos && it.end?.pos)
        .map(it => {
          const [startX, startY] = it.start!.pos!;
          const [endX, endY] = it.end!.pos!;
          return (
            <path
              key={it.id}
              d={`M ${startX},${startY} C ${startX + 100},${startY} ${
                endX - 100
              },${endY} ${endX},${endY}`}
              strokeWidth={4}
              fill="transparent"
              stroke={`rgb(${it.color})`}
            />
          );
        })}

      <foreignObject x={0} y={0} width={1000} height={1000}></foreignObject>
      <context.Provider value={value}>{children}</context.Provider>
    </svg>
  );
}
