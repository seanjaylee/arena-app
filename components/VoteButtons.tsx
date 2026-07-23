import type { Side } from "@/lib/types";

export default function VoteButtons({
  labelA,
  labelB,
  myVote,
  disabled,
  ended,
  onVote,
}: {
  labelA: string;
  labelB: string;
  myVote: Side | null;
  disabled: boolean;
  ended: boolean;
  onVote: (side: Side) => void;
}) {
  return (
    <div className="flex items-stretch gap-3">
      <CornerButton
        corner="a"
        label={labelA}
        selected={myVote === "A"}
        dimmed={myVote === "B"}
        disabled={disabled}
        ended={ended}
        onClick={() => onVote("A")}
      />
      <CornerButton
        corner="b"
        label={labelB}
        selected={myVote === "B"}
        dimmed={myVote === "A"}
        disabled={disabled}
        ended={ended}
        onClick={() => onVote("B")}
      />
    </div>
  );
}

function CornerButton({
  corner,
  label,
  selected,
  dimmed,
  disabled,
  ended,
  onClick,
}: {
  corner: "a" | "b";
  label: string;
  selected: boolean;
  dimmed: boolean;
  disabled: boolean;
  ended: boolean;
  onClick: () => void;
}) {
  const isA = corner === "a";
  const base =
    "relative flex-1 rounded-2xl border px-4 py-4 text-sm font-bold transition duration-200 disabled:cursor-not-allowed";

  let style: string;
  if (selected) {
    style = isA
      ? "border-corner-a bg-corner-a text-white shadow-lg shadow-corner-a/25"
      : "border-corner-b bg-corner-b text-white shadow-lg shadow-corner-b/25";
  } else if (dimmed || ended) {
    style = "border-line bg-surface text-muted opacity-60";
  } else {
    style = isA
      ? "border-line bg-surface text-ink hover:border-corner-a hover:bg-corner-a/10 active:scale-[0.98]"
      : "border-line bg-surface text-ink hover:border-corner-b hover:bg-corner-b/10 active:scale-[0.98]";
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${style}`}>
      <span
        className={`mb-1 block text-[10px] font-black uppercase tracking-widest ${
          selected ? "text-white/80" : isA ? "text-corner-a/80" : "text-corner-b/80"
        }`}
      >
        {isA ? "Red Corner" : "Blue Corner"}
      </span>
      <span className="line-clamp-2 leading-tight">{label}</span>
      {selected && <span className="mt-1.5 block text-[11px] font-semibold">✓ 내 선택</span>}
    </button>
  );
}
