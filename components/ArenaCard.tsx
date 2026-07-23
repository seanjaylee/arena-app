import Link from "next/link";
import Image from "next/image";
import VoteBar from "@/components/VoteBar";
import { timeLeftLabel, isEnded } from "@/lib/time";
import type { ArenaWithStats } from "@/lib/arena-data";

export default function ArenaCard({ arena, votesA, votesB, commentCount }: ArenaWithStats) {
  const ended = isEnded(arena.end_at);

  return (
    <Link
      href={`/arena/${arena.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface transition duration-200 hover:border-line hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40"
    >
      {/* 헤더: 제목 + 상태 뱃지 */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <h2 className="text-[15px] font-bold leading-snug text-ink">
          {arena.title || `${arena.side_a_title} vs ${arena.side_b_title}`}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            ended
              ? "bg-surface-2 text-muted"
              : "bg-corner-a/10 text-corner-a-soft"
          }`}
        >
          {ended ? "종료" : timeLeftLabel(arena.end_at)}
        </span>
      </div>

      {/* 대진: A 이미지 · VS · B 이미지 */}
      <div className="relative flex items-center gap-2 px-4 py-4">
        <SideThumb title={arena.side_a_title} image={arena.side_a_image} corner="a" />

        <div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-[11px] font-black italic text-ink shadow-lg">
          VS
        </div>

        <SideThumb title={arena.side_b_title} image={arena.side_b_image} corner="b" />
      </div>

      {/* 득표율 바 */}
      <div className="px-4 pb-3">
        <VoteBar
          votesA={votesA}
          votesB={votesB}
          labelA={arena.side_a_title}
          labelB={arena.side_b_title}
        />
      </div>

      {/* 푸터: 댓글 수 */}
      <div className="flex items-center gap-1.5 border-t border-line-soft px-4 py-2.5 text-[12px] font-medium text-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-70">
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        논쟁 {commentCount}개
      </div>
    </Link>
  );
}

function SideThumb({
  title,
  image,
  corner,
}: {
  title: string;
  image: string | null;
  corner: "a" | "b";
}) {
  const ring = corner === "a" ? "ring-corner-a/30" : "ring-corner-b/30";
  const fallback = corner === "a" ? "from-corner-a/25" : "from-corner-b/25";

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className={`relative aspect-square w-full overflow-hidden rounded-xl ring-1 ${ring}`}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 40vw, 200px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${fallback} to-surface-2`} />
        )}
      </div>
      <span className="line-clamp-1 w-full text-center text-[13px] font-semibold text-ink-soft">
        {title}
      </span>
    </div>
  );
}
