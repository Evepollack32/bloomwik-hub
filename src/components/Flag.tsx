interface Props {
  /** ISO 3166-1 alpha-2 region code, e.g. "US". */
  region: string;
  className?: string;
}

/**
 * Image-based flag: emoji flags don't render on Windows, which showed
 * bare letters like "US" / "GB" instead of a flag.
 */
export function Flag({ region, className = "" }: Props) {
  const code = region.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={20}
      height={15}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`inline-block h-[15px] w-[20px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 ${className}`}
    />
  );
}
