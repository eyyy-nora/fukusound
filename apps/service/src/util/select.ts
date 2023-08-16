export function select<T extends string | number | symbol, V>(
  value: T,
  map: Record<T, V>,
): V {
  return map[value];
}
