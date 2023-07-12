import clsx from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import classes from "./pagination.module.css";

export interface PaginationProps {
  pages: number;
  current: number;
  extraElements?: number;
  className?: string;
}

function PaginationButton({
  page,
  current,
}: {
  page: number;
  current: number;
}) {
  const disabled = page === current;
  return (
    <Link
      href={`?page=${page + 1}`}
      tabIndex={disabled ? -1 : undefined}
      className={clsx(classes.pagingButton, disabled && classes.active)}>
      {page + 1}
    </Link>
  );
}

function PaginationExtraButton() {
  return (
    <button className={clsx(classes.pagingButton, classes.pagingExtra)}>
      ...
    </button>
  );
}

function PaginationPrevButton({ current }: { current: number; pages: number }) {
  const disabled = current <= 0;
  return (
    <Link
      href={disabled ? "#" : `?page=${current}`}
      tabIndex={disabled ? -1 : undefined}
      className={clsx(classes.pagingButton, disabled && classes.disabled)}>
      <MdChevronLeft className="inline-block" />
    </Link>
  );
}

function PaginationNextButton({
  current,
  pages,
}: {
  current: number;
  pages: number;
}) {
  const disabled = current >= pages - 1;
  return (
    <Link
      href={disabled ? "#" : `?page=${current + 2}`}
      tabIndex={disabled ? -1 : undefined}
      className={clsx(classes.pagingButton, disabled && classes.disabled)}>
      <MdChevronRight className="inline-block" />
    </Link>
  );
}

function clampedBounds({
  lower,
  upper,
  current,
  extra,
}: {
  lower: number;
  upper: number;
  current: number;
  extra: number;
}): [start: number, end: number] {
  const rangeAmount = extra * 2 + 1;
  let rangeStart: number, rangeEnd: number;
  if (current + extra >= upper) {
    rangeEnd = Math.min(upper, current + extra);
    rangeStart = Math.max(lower, rangeEnd - rangeAmount);
  } else {
    rangeStart = Math.max(lower, current - extra);
    rangeEnd = Math.min(upper, rangeStart + rangeAmount);
  }
  return [rangeStart, rangeEnd];
}

function paginationBounds({
  lower,
  upper,
  current,
  extra,
}: {
  lower: number;
  upper: number;
  current: number;
  extra: number;
}): [start: number, end: number] {
  let [start, end] = clampedBounds({ lower, upper, current, extra });
  const startGap = start - lower;
  const endGap = upper - end;
  if (startGap < 1) end = Math.min(end + 2, upper);
  else if (startGap < 2) end = Math.min(end + 1, upper);
  else if (startGap < 3) start = Math.max(start - 1, lower);
  if (endGap < 1) start = Math.max(start - 2, lower);
  else if (endGap < 2) start = Math.max(start - 1, lower);
  else if (endGap < 3) end = Math.min(end + 1, upper);
  return [start, end];
}

function arrayRange([start, end]: [start: number, end: number]): number[] {
  return Array.from({ length: end - start }, (_, n) => start + n);
}

export function Pagination({
  pages,
  current,
  extraElements = 1,
  className,
}: PaginationProps) {
  const buttons = useMemo(() => {
    if (pages < extraElements * 2 + 4)
      return Array.from({ length: pages }, (_, i) => (
        <PaginationButton page={i} current={current} key={i} />
      ));

    const [start, end] = paginationBounds({
      lower: 0,
      upper: pages,
      extra: extraElements,
      current,
    });

    const range = arrayRange([start, end]);
    const elements = range.map(page => (
      <PaginationButton page={page} current={current} key={page} />
    ));
    if (current - extraElements > 0) {
      if (current - extraElements > 2)
        elements.unshift(<PaginationExtraButton key="prev" />);
      elements.unshift(<PaginationButton page={0} current={current} />);
    }
    if (current + extraElements < pages - 1) {
      if (current + extraElements < pages - 3)
        elements.push(<PaginationExtraButton key="next" />);
      elements.push(<PaginationButton page={pages - 1} current={current} />);
    }
    return elements;
  }, [pages, current, extraElements]);

  return (
    <div className={clsx(classes.pagination, className)}>
      <PaginationPrevButton current={current} pages={pages} />
      {buttons}
      <PaginationNextButton current={current} pages={pages} />
    </div>
  );
}
