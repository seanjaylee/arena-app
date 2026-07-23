"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArenaCard from "@/components/ArenaCard";
import { isEnded } from "@/lib/time";
import type { ArenaWithStats } from "@/lib/arena-data";

type SortKey = "deadline" | "votes";

export default function ArenaFeed({ items }: { items: ArenaWithStats[] }) {
  const [sort, setSort] = useState<SortKey>("deadline");

  const sorted = useMemo(() => {
    const active = items.filter((i) => !isEnded(i.arena.end_at));
    const ended = items.filter((i) => isEnded(i.arena.end_at));

    const sortFn =
      sort === "deadline"
        ? (a: ArenaWithStats, b: ArenaWithStats) =>
            new Date(a.arena.end_at).getTime() - new Date(b.arena.end_at).getTime()
        : (a: ArenaWithStats, b: ArenaWithStats) =>
            b.votesA + b.votesB - (a.votesA + a.votesB);

    return [...active.sort(sortFn), ...ended.sort((a, b) =>
      new Date(b.arena.end_at).getTime() - new Date(a.arena.end_at).getTime()
    )];
  }, [items, sort]);

  return (
    <div className="relative mx-auto max-w-xl px-4 py-6">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSort("deadline")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            sort === "deadline" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          마감 임박순
        </button>
        <button
          onClick={() => setSort("votes")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            sort === "votes" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          득표수 많은 순
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-20 text-center text-gray-400">아직 열린 대결이 없어요. 첫 대결을 만들어보세요!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((item) => (
            <ArenaCard key={item.arena.id} {...item} />
          ))}
        </div>
      )}

      <Link
        href="/arena/new"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-lg hover:bg-gray-800"
        aria-label="대결 만들기"
      >
        +
      </Link>
    </div>
  );
}
