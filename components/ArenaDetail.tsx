"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import VoteBar from "@/components/VoteBar";
import VoteButtons from "@/components/VoteButtons";
import CommentList from "@/components/CommentList";
import CommentItem from "@/components/CommentItem";
import CommentInput from "@/components/CommentInput";
import ShareButton from "@/components/ShareButton";
import { isEnded, timeLeftLabel } from "@/lib/time";
import { enrichComments, pickBestComment, sortNewest } from "@/lib/comment-data";
import type { Arena, Side } from "@/lib/types";
import type { CommentWithProfile, CommentWithMeta } from "@/lib/comment-types";

export default function ArenaDetail({
  arena,
  initialVotesA,
  initialVotesB,
  initialMyVote,
  initialComments,
  currentUserId,
}: {
  arena: Arena;
  initialVotesA: number;
  initialVotesB: number;
  initialMyVote: Side | null;
  initialComments: CommentWithMeta[];
  currentUserId: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [votesA, setVotesA] = useState(initialVotesA);
  const [votesB, setVotesB] = useState(initialVotesB);
  const [myVote, setMyVote] = useState<Side | null>(initialMyVote);
  const [comments, setComments] = useState<CommentWithMeta[]>(initialComments);
  const [tab, setTab] = useState<Side>(initialMyVote ?? "A");
  const [voting, setVoting] = useState(false);
  const [mergedView, setMergedView] = useState(false);

  const ended = isEnded(arena.end_at);

  const refresh = useCallback(async () => {
    const [{ data: votes }, { data: freshComments }, { data: likes }] = await Promise.all([
      supabase.from("votes").select("side").eq("arena_id", arena.id),
      supabase
        .from("comments")
        .select("*, profiles(nickname, profile_img)")
        .eq("arena_id", arena.id)
        .order("created_at", { ascending: true }),
      supabase.from("comment_likes").select("comment_id, user_id").eq("arena_id", arena.id),
    ]);

    if (votes) {
      setVotesA(votes.filter((v) => v.side === "A").length);
      setVotesB(votes.filter((v) => v.side === "B").length);
    }
    if (freshComments) {
      setComments(
        enrichComments(
          freshComments as unknown as CommentWithProfile[],
          likes ?? [],
          currentUserId
        )
      );
    }
  }, [supabase, arena.id, currentUserId]);

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleVote = async (side: Side) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (myVote || ended || voting) return;

    setVoting(true);
    setMyVote(side);
    setTab(side);
    if (side === "A") setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);

    const { error } = await supabase
      .from("votes")
      .insert({ arena_id: arena.id, user_id: currentUserId, side });

    setVoting(false);
    if (error) {
      setMyVote(null);
      if (side === "A") setVotesA((v) => v - 1);
      else setVotesB((v) => v - 1);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const wasLiked = target.liked_by_me;

    // 낙관적 업데이트
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              liked_by_me: !wasLiked,
              like_count: c.like_count + (wasLiked ? -1 : 1),
            }
          : c
      )
    );

    const { error } = wasLiked
      ? await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId)
      : await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, arena_id: arena.id, user_id: currentUserId });

    if (error) {
      // 실패 시 롤백
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked_by_me: wasLiked,
                like_count: c.like_count + (wasLiked ? 1 : -1),
              }
            : c
        )
      );
    }
  };

  const handleComment = async (body: string, spoiler: boolean) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (!myVote) return;

    await supabase.from("comments").insert({
      arena_id: arena.id,
      user_id: currentUserId,
      side: myVote,
      body,
      spoiler_flag: spoiler,
    });
    await refresh();
  };

  // 전체 댓글 중 좋아요 1위를 베스트로, 나머지는 편별 최신순
  const { best, restByTab, commentCountA, commentCountB } = useMemo(() => {
    const { best, rest } = pickBestComment(comments);
    return {
      best,
      restByTab: {
        A: sortNewest(rest.filter((c) => c.side === "A")),
        B: sortNewest(rest.filter((c) => c.side === "B")),
      },
      commentCountA: comments.filter((c) => c.side === "A").length,
      commentCountB: comments.filter((c) => c.side === "B").length,
    };
  }, [comments]);

  const displayTitle = arena.title || `${arena.side_a_title} vs ${arena.side_b_title}`;

  const bestSideLabel = best
    ? best.side === "A"
      ? arena.side_a_title
      : arena.side_b_title
    : "";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
      {/* 제목 + 상태 */}
      <div className="flex flex-col gap-2.5">
        <span
          className={`w-fit rounded-full px-3 py-1 text-[13px] font-semibold ${
            ended ? "bg-surface-2 text-muted" : "bg-corner-a/10 text-corner-a-soft"
          }`}
        >
          {ended ? "종료된 대결" : timeLeftLabel(arena.end_at)}
        </span>
        <h1 className="text-2xl font-bold leading-snug text-ink">{displayTitle}</h1>
      </div>

      {/* 히어로 대진 */}
      <div className="relative flex items-stretch gap-3 rounded-2xl border border-line bg-surface p-4">
        <SideImage title={arena.side_a_title} image={arena.side_a_image} corner="a" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-[13px] font-black italic text-ink shadow-xl">
          VS
        </div>
        <SideImage title={arena.side_b_title} image={arena.side_b_image} corner="b" />
      </div>

      {/* 득표율 */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <VoteBar
          votesA={votesA}
          votesB={votesB}
          labelA={arena.side_a_title}
          labelB={arena.side_b_title}
          size="lg"
        />
      </div>

      {/* 투표 */}
      {!ended && !myVote && (
        <p className="-mb-2 text-center text-sm font-medium text-muted">
          어느 편인가요? 투표하면 댓글로 참전할 수 있어요.
        </p>
      )}
      <VoteButtons
        labelA={arena.side_a_title}
        labelB={arena.side_b_title}
        myVote={myVote}
        disabled={ended || !!myVote || voting}
        ended={ended}
        onVote={handleVote}
      />

      {/* 공유 (바이럴): 투표 전 "친구한테 물어보기" · 투표 후 "우리 편 초대하기" */}
      {!ended && (
        <div className="-mt-2 flex flex-col gap-1.5">
          <ShareButton
            title={displayTitle}
            labelA={arena.side_a_title}
            labelB={arena.side_b_title}
            mySide={myVote}
          />
          <p className="text-center text-[13px] text-faint">
            {myVote ? "같은 편을 데려와 득표율을 뒤집어요" : "친구 의견도 궁금하죠? 링크로 물어보세요"}
          </p>
        </div>
      )}

      {/* 논쟁 스레드 */}
      <div className="mt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink">논쟁 스레드</h2>
          <button
            type="button"
            onClick={() => setMergedView((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
              mergedView
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
            aria-pressed={mergedView}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
            {mergedView ? "한쪽씩 보기" : "양쪽 같이 보기"}
          </button>
        </div>

        {/* 베스트 댓글 고정 */}
        {best && (
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[13px] font-bold text-gold">
                🔥 베스트 논쟁
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                  best.side === "A"
                    ? "bg-corner-a/10 text-corner-a-soft"
                    : "bg-corner-b/10 text-corner-b-soft"
                }`}
              >
                {bestSideLabel}파
              </span>
            </div>
            <CommentItem comment={best} onLike={handleLike} highlight />
          </div>
        )}

        {mergedView ? (
          /* 양쪽 같이 보기: 2열 분할로 반대 의견을 나란히 */
          <div className="grid grid-cols-2 gap-2.5">
            <ThreadColumn
              corner="a"
              label={arena.side_a_title}
              count={commentCountA}
              comments={restByTab.A}
              onLike={handleLike}
            />
            <ThreadColumn
              corner="b"
              label={arena.side_b_title}
              count={commentCountB}
              comments={restByTab.B}
              onLike={handleLike}
            />
          </div>
        ) : (
          /* 한쪽씩 보기: 편별 탭 */
          <>
            <div className="mb-4 flex gap-2">
              <ThreadTab
                active={tab === "A"}
                corner="a"
                label={`${arena.side_a_title}파`}
                count={commentCountA}
                onClick={() => setTab("A")}
              />
              <ThreadTab
                active={tab === "B"}
                corner="b"
                label={`${arena.side_b_title}파`}
                count={commentCountB}
                onClick={() => setTab("B")}
              />
            </div>
            <CommentList comments={restByTab[tab]} onLike={handleLike} />
          </>
        )}
      </div>

      {/* 댓글 입력 */}
      {myVote ? (
        <CommentInput side={myVote} onSubmit={handleComment} />
      ) : (
        <p className="rounded-xl border border-dashed border-line py-3.5 text-center text-sm text-muted">
          {ended ? "종료된 대결입니다." : "투표 후 댓글을 남길 수 있어요."}
        </p>
      )}
    </div>
  );
}

function ThreadColumn({
  corner,
  label,
  count,
  comments,
  onLike,
}: {
  corner: "a" | "b";
  label: string;
  count: number;
  comments: CommentWithMeta[];
  onLike: (commentId: string) => void;
}) {
  const isA = corner === "a";
  const headerStyle = isA
    ? "border-corner-a/30 bg-corner-a/10 text-corner-a-soft"
    : "border-corner-b/30 bg-corner-b/10 text-corner-b-soft";

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={`sticky top-[57px] z-[1] flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[13px] font-bold backdrop-blur ${headerStyle}`}
      >
        <span className="line-clamp-1">{label}파</span>
        <span className="text-[12px] opacity-70">{count}</span>
      </div>
      {comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-8 text-center text-[13px] text-muted">
          아직 없어요
        </p>
      ) : (
        comments.map((c) => (
          <CommentItem key={c.id} comment={c} onLike={onLike} compact />
        ))
      )}
    </div>
  );
}

function ThreadTab({
  active,
  corner,
  label,
  count,
  onClick,
}: {
  active: boolean;
  corner: "a" | "b";
  label: string;
  count: number;
  onClick: () => void;
}) {
  const isA = corner === "a";
  const activeStyle = isA
    ? "border-corner-a bg-corner-a/10 text-corner-a-soft"
    : "border-corner-b bg-corner-b/10 text-corner-b-soft";
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-[15px] font-semibold transition ${
        active ? activeStyle : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      <span className="line-clamp-1">{label}</span>
      <span className="text-[13px] opacity-70">{count}</span>
    </button>
  );
}

function SideImage({
  title,
  image,
  corner,
}: {
  title: string;
  image: string | null;
  corner: "a" | "b";
}) {
  const isA = corner === "a";
  const ring = isA ? "ring-corner-a/40" : "ring-corner-b/40";
  const fallback = isA ? "from-corner-a/25" : "from-corner-b/25";
  const tag = isA ? "text-corner-a" : "text-corner-b";

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className={`relative aspect-square w-full overflow-hidden rounded-xl ring-1 ${ring}`}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, 240px"
            className="object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${fallback} to-surface-2`} />
        )}
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest ${tag}`}>
        {isA ? "Red" : "Blue"}
      </span>
      <span className="line-clamp-1 text-center text-[15px] font-bold text-ink">{title}</span>
    </div>
  );
}
