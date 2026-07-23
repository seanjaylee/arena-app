"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import VoteBar from "@/components/VoteBar";
import VoteButtons from "@/components/VoteButtons";
import CommentList from "@/components/CommentList";
import CommentInput from "@/components/CommentInput";
import { isEnded, timeLeftLabel } from "@/lib/time";
import type { Arena, Side } from "@/lib/types";
import type { CommentWithProfile } from "@/lib/comment-types";

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
  initialComments: CommentWithProfile[];
  currentUserId: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [votesA, setVotesA] = useState(initialVotesA);
  const [votesB, setVotesB] = useState(initialVotesB);
  const [myVote, setMyVote] = useState<Side | null>(initialMyVote);
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments);
  const [tab, setTab] = useState<Side>(initialMyVote ?? "A");
  const [voting, setVoting] = useState(false);

  const ended = isEnded(arena.end_at);

  const refresh = useCallback(async () => {
    const { data: votes } = await supabase.from("votes").select("side").eq("arena_id", arena.id);
    if (votes) {
      setVotesA(votes.filter((v) => v.side === "A").length);
      setVotesB(votes.filter((v) => v.side === "B").length);
    }
    const { data: freshComments } = await supabase
      .from("comments")
      .select("*, profiles(nickname, profile_img)")
      .eq("arena_id", arena.id)
      .order("created_at", { ascending: true });
    if (freshComments) setComments(freshComments as unknown as CommentWithProfile[]);
  }, [supabase, arena.id]);

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

  const filteredComments = comments.filter((c) => c.side === tab);
  const commentCountA = comments.filter((c) => c.side === "A").length;
  const commentCountB = comments.filter((c) => c.side === "B").length;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-5">
      {/* 제목 + 상태 */}
      <div className="flex flex-col gap-2">
        <span
          className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            ended ? "bg-surface-2 text-muted" : "bg-corner-a/10 text-corner-a-soft"
          }`}
        >
          {ended ? "종료된 대결" : timeLeftLabel(arena.end_at)}
        </span>
        <h1 className="text-xl font-bold leading-snug text-ink">
          {arena.title || `${arena.side_a_title} vs ${arena.side_b_title}`}
        </h1>
      </div>

      {/* 히어로 대진 */}
      <div className="relative flex items-stretch gap-3 rounded-2xl border border-line bg-surface p-4">
        <SideImage title={arena.side_a_title} image={arena.side_a_image} corner="a" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-xs font-black italic text-ink shadow-xl">
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
        <p className="-mb-2 text-center text-xs font-medium text-muted">
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

      {/* 논쟁 스레드 */}
      <div className="mt-2">
        <h2 className="mb-3 text-sm font-bold text-ink">논쟁 스레드</h2>
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
        <CommentList comments={filteredComments} />
      </div>

      {/* 댓글 입력 */}
      {myVote ? (
        <CommentInput side={myVote} onSubmit={handleComment} />
      ) : (
        <p className="rounded-xl border border-dashed border-line py-3 text-center text-xs text-muted">
          {ended ? "종료된 대결입니다." : "투표 후 댓글을 남길 수 있어요."}
        </p>
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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
        active ? activeStyle : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      <span className="line-clamp-1">{label}</span>
      <span className="text-xs opacity-70">{count}</span>
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
      <span className={`text-[10px] font-black uppercase tracking-widest ${tag}`}>
        {isA ? "Red" : "Blue"}
      </span>
      <span className="line-clamp-1 text-center text-sm font-bold text-ink">{title}</span>
    </div>
  );
}
