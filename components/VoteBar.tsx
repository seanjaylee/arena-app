export default function VoteBar({
  votesA,
  votesB,
  labelA,
  labelB,
  size = "md",
}: {
  votesA: number;
  votesB: number;
  labelA: string;
  labelB: string;
  size?: "md" | "lg";
}) {
  const total = votesA + votesB;
  const pctA = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const pctB = 100 - pctA;
  const leadA = pctA > pctB;
  const leadB = pctB > pctA;

  const pctClass = size === "lg" ? "text-3xl" : "text-xl";
  const barH = size === "lg" ? "h-3.5" : "h-3";

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tabular-nums ${pctClass} ${
              leadA ? "text-corner-a" : "text-ink-soft"
            }`}
          >
            {pctA}%
          </span>
          <span className="max-w-[8rem] truncate text-[13px] font-medium text-muted">
            {labelA}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="max-w-[8rem] truncate text-right text-[13px] font-medium text-muted">
            {labelB}
          </span>
          <span
            className={`font-black tabular-nums ${pctClass} ${
              leadB ? "text-corner-b" : "text-ink-soft"
            }`}
          >
            {pctB}%
          </span>
        </div>
      </div>

      <div className={`flex ${barH} w-full overflow-hidden rounded-full bg-surface-2`}>
        <div
          className="h-full bg-gradient-to-r from-corner-a/80 to-corner-a transition-all duration-500 ease-out"
          style={{ width: `${pctA}%` }}
        />
        <div className="w-px shrink-0 bg-bg/60" />
        <div
          className="h-full bg-gradient-to-l from-corner-b/80 to-corner-b transition-all duration-500 ease-out"
          style={{ width: `${pctB}%` }}
        />
      </div>

      <p className="mt-2 text-center text-[13px] font-medium text-faint">
        {total === 0 ? "아직 표가 없어요" : `총 ${total.toLocaleString()}표`}
      </p>
    </div>
  );
}
