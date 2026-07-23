export default function VoteBar({
  votesA,
  votesB,
  labelA,
  labelB,
}: {
  votesA: number;
  votesB: number;
  labelA: string;
  labelB: string;
}) {
  const total = votesA + votesB;
  const pctA = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
        <span>{labelA} {pctA}%</span>
        <span>{labelB} {pctB}%</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-rose-500" style={{ width: `${pctA}%` }} />
        <div className="h-full bg-indigo-500" style={{ width: `${pctB}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-400">총 {total}표</p>
    </div>
  );
}
