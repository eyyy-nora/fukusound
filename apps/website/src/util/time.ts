export function formatTime(time: number) {
  const s = Math.floor((time / 1000) % 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((time / 60000) % 60).toString();
  const h = Math.floor(time / 3600000);
  if (h) return `${h}:${m.padStart(2, "0")}:${s}`;
  else return `${m}:${s}`;
}
