"use client";

import CommentItem from "@/components/CommentItem";
import type { CommentWithMeta } from "@/lib/comment-types";

export default function CommentList({
  comments,
  onLike,
  sideLabels,
  emptyText = "아직 이 편엔 댓글이 없어요. 첫 논쟁을 시작해보세요.",
}: {
  comments: CommentWithMeta[];
  onLike: (commentId: string) => void;
  /** 지정 시 각 댓글에 편(A/B) 배지를 표시 — 양쪽 같이 보기용 */
  sideLabels?: { A: string; B: string };
  emptyText?: string;
}) {
  if (comments.length === 0) {
    return <p className="py-10 text-center text-[15px] text-muted">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          onLike={onLike}
          sideBadge={
            sideLabels
              ? {
                  corner: c.side === "A" ? "a" : "b",
                  label: `${c.side === "A" ? sideLabels.A : sideLabels.B}파`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
