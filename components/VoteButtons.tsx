import type { Side } from "@/lib/types";

export default function VoteButtons({
  labelA,
  labelB,
  myVote,
  disabled,
  onVote,
}: {
  labelA: string;
  labelB: string;
  myVote: Side | null;
  disabled: boolean;
  onVote: (side: Side) => void;
}) {
  const base =
    "flex-1 rounded-xl py-3 text-sm font-semibold border transition disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onVote("A")}
        className={`${base} ${
          myVote === "A"
            ? "border-rose-500 bg-rose-500 text-white"
            : "border-gray-300 text-gray-700 hover:border-rose-300"
        }`}
      >
        {labelA} {myVote === "A" ? "✓ 내 선택" : ""}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onVote("B")}
        className={`${base} ${
          myVote === "B"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 text-gray-700 hover:border-indigo-300"
        }`}
      >
        {labelB} {myVote === "B" ? "✓ 내 선택" : ""}
      </button>
    </div>
  );
}
