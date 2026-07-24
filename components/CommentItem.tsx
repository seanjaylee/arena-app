"use client";

import { useState } from "react";
import type { CommentWithMeta } from "@/lib/comment-types";

export default function CommentItem({
  comment,
  onLike,
  highlight = false,
  sideBadge,
  compact = false,
}: {
  comment: CommentWithMeta;
  onLike: (commentId: string) => void;
  highlight?: boolean;
  sideBadge?: { corner: "a" | "b"; label: string };
  compact?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isBlurred = comment.spoiler_flag && !revealed;

  const sideAccent =
    sideBadge && !highlight
      ? sideBadge.corner === "a"
        ? "border-l-2 border-l-corner-a/60"
        : "border-l-2 border-l-corner-b/60"
      : "";

  const bodyText = compact ? "text-[13.5px]" : "text-[15px]";
  const metaText = compact ? "text-[11px]" : "text-[13px]";
  const pad = compact ? "p-3" : "p-4";

  return (
    <div
      className={`rounded-xl border ${pad} ${sideAccent} ${
        highlight ? "border-gold/40 bg-gold/[0.06]" : "border-line bg-surface"
      }`}
    >
      <div className={`mb-2 flex items-center justify-between gap-2 ${metaText} text-muted`}>
        <span className="flex min-w-0 items-center gap-1.5">
          {sideBadge && (
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                sideBadge.corner === "a"
                  ? "bg-corner-a/10 text-corner-a-soft"
                  : "bg-corner-b/10 text-corner-b-soft"
              }`}
            >
              {sideBadge.label}
            </span>
          )}
          <span className="truncate font-semibold text-ink-soft">
            {comment.profiles?.nickname ?? "탈퇴한 유저"}
          </span>
        </span>
        <span className="shrink-0">
          {new Date(comment.created_at).toLocaleString("ko-KR", {
            dateStyle: compact ? undefined : "short",
            timeStyle: "short",
          })}
        </span>
      </div>

      {isBlurred ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="group relative w-full overflow-hidden rounded-lg bg-surface-2 py-4 text-left"
        >
          <span className={`block select-none px-2 ${bodyText} text-ink-soft blur-sm`}>
            {comment.body}
          </span>
          <span className="absolute inset-0 flex items-center justify-center gap-1 px-1 text-center text-[12px] font-semibold text-gold">
            ⚠ 스포일러 · 눌러서 보기
          </span>
        </button>
      ) : (
        <p className={`whitespace-pre-wrap ${bodyText} leading-relaxed text-ink-soft`}>
          {comment.spoiler_flag && (
            <span className="mr-1.5 rounded bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-gold">
              스포일러
            </span>
          )}
          {comment.body}
        </p>
      )}

      <div className="mt-3 flex items-center">
        <button
          type="button"
          onClick={() => onLike(comment.id)}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition ${
            comment.liked_by_me
              ? "border-corner-a/50 bg-corner-a/10 text-corner-a-soft"
              : "border-line bg-surface-2 text-muted hover:text-ink"
          }`}
          aria-pressed={comment.liked_by_me}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={comment.liked_by_me ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {comment.like_count > 0 ? comment.like_count.toLocaleString() : "좋아요"}
        </button>
      </div>
    </div>
  );
}
