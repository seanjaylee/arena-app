"use client";

import { useState } from "react";
import type { CommentWithProfile } from "@/lib/comment-types";

export default function CommentList({ comments }: { comments: CommentWithProfile[] }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (comments.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        아직 이 편엔 댓글이 없어요. 첫 논쟁을 시작해보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {comments.map((c) => {
        const isBlurred = c.spoiler_flag && !revealed.has(c.id);
        return (
          <div key={c.id} className="rounded-xl border border-line bg-surface p-3.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
              <span className="font-semibold text-ink-soft">
                {c.profiles?.nickname ?? "탈퇴한 유저"}
              </span>
              <span>{new Date(c.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            {isBlurred ? (
              <button
                type="button"
                onClick={() => setRevealed((prev) => new Set(prev).add(c.id))}
                className="group relative w-full overflow-hidden rounded-lg bg-surface-2 py-3 text-left"
              >
                <span className="block select-none px-2 text-sm text-ink-soft blur-sm">
                  {c.body}
                </span>
                <span className="absolute inset-0 flex items-center justify-center gap-1 text-[11px] font-semibold text-gold">
                  ⚠ 스포일러 · 눌러서 보기
                </span>
              </button>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {c.spoiler_flag && (
                  <span className="mr-1.5 rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                    스포일러
                  </span>
                )}
                {c.body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
