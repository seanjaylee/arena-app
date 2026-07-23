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

    return [
      ...active.sort(sortFn),
      ...ended.sort(
        (a, b) => new Date(b.arena.end_at).getTime() - new Date(a.arena.end_at).getTime()
      ),
    ];
  }, [items, sort]);

  return (
    <div className="relative mx-auto max-w-xl px-4 pb-24 pt-5">
      {/* 정렬 탭 */}
      <div className="mb-5 flex gap-1 rounded-full border border-line bg-surface p-1">
        <SortTab active={sort === "deadline"} onClick={() => setSort("deadline")}>
          마감 임박순
        </SortTab>
        <SortTab active={sort === "votes"} onClick={() => setSort("votes")}>
          득표수 많은 순
        </SortTab>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-corner-a to-corner-b text-sm font-black italic text-white">
            VS
          </div>
          <div>
            <p className="font-semibold text-ink">아직 열린 대결이 없어요</p>
            <p className="mt-1 text-sm text-muted">첫 대결을 만들어 투기장을 열어보세요!</p>
          </div>
          <Link
            href="/arena/new"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            대결 만들기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {sorted.map((item, i) => (
            <div
              key={item.arena.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <ArenaCard {...item} />
            </div>
          ))}
        </div>
      )}

      {/* 대결 만들기 플로팅 버튼 */}
      <Link
        href="/arena/new"
        className="fixed bottom-6 right-[calc(50%-14rem)] z-20 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-corner-a to-corner-b px-5 font-semibold text-white shadow-xl shadow-corner-a/25 transition hover:scale-105 max-[600px]:right-5"
        aria-label="대결 만들기"
      >
        <span className="text-xl leading-none">+</span>
        <span className="text-sm">대결 만들기</span>
      </Link>
    </div>
  );
}

function SortTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-ink text-bg" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
