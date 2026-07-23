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
      className="block rounded-2xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">
          {arena.title || `${arena.side_a_title} vs ${arena.side_b_title}`}
        </h2>
        <span className={`text-xs font-medium ${ended ? "text-gray-400" : "text-rose-500"}`}>
          {ended ? "종료됨" : timeLeftLabel(arena.end_at)}
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          {arena.side_a_image ? (
            <Image
              src={arena.side_a_image}
              alt={arena.side_a_title}
              width={120}
              height={120}
              className="h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-rose-50" />
          )}
          <span className="text-sm font-medium text-center">{arena.side_a_title}</span>
        </div>
        <div className="flex items-center text-gray-300 font-bold">VS</div>
        <div className="flex-1 flex flex-col items-center gap-1">
          {arena.side_b_image ? (
            <Image
              src={arena.side_b_image}
              alt={arena.side_b_title}
              width={120}
              height={120}
              className="h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-indigo-50" />
          )}
          <span className="text-sm font-medium text-center">{arena.side_b_title}</span>
        </div>
      </div>

      <VoteBar
        votesA={votesA}
        votesB={votesB}
        labelA={arena.side_a_title}
        labelB={arena.side_b_title}
      />

      <p className="mt-2 text-xs text-gray-400">댓글 {commentCount}개</p>
    </Link>
  );
}
