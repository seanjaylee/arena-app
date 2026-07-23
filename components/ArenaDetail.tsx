"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import VoteBar from "@/components/VoteBar";
import VoteButtons from "@/components/VoteButtons";
import CommentList from "@/components/CommentList";
import CommentInput from "@/components/CommentInput";
import { isEnded } from "@/lib/time";
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

  return (
    <div className="mx-auto max-w-xl px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="mb-1 text-lg font-bold">
          {arena.title || `${arena.side_a_title} vs ${arena.side_b_title}`}
        </h1>
        <p className="text-xs text-gray-400">{ended ? "종료됨" : "진행 중"}</p>
      </div>

      <div className="flex gap-4">
        <SideImage title={arena.side_a_title} image={arena.side_a_image} />
        <SideImage title={arena.side_b_title} image={arena.side_b_image} />
      </div>

      <VoteBar
        votesA={votesA}
        votesB={votesB}
        labelA={arena.side_a_title}
        labelB={arena.side_b_title}
      />

      <VoteButtons
        labelA={arena.side_a_title}
        labelB={arena.side_b_title}
        myVote={myVote}
        disabled={ended || !!myVote || voting}
        onVote={handleVote}
      />

      <div>
        <div className="mb-3 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab("A")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "A" ? "border-rose-500 text-rose-600" : "border-transparent text-gray-400"
            }`}
          >
            {arena.side_a_title}파
          </button>
          <button
            onClick={() => setTab("B")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "B" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400"
            }`}
          >
            {arena.side_b_title}파
          </button>
        </div>
        <CommentList comments={filteredComments} />
      </div>

      {myVote ? (
        <CommentInput side={myVote} onSubmit={handleComment} />
      ) : (
        <p className="border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
          투표 후 댓글을 남길 수 있어요.
        </p>
      )}
    </div>
  );
}

function SideImage({ title, image }: { title: string; image: string | null }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      {image ? (
        <Image
          src={image}
          alt={title}
          width={160}
          height={160}
          className="h-32 w-32 rounded-xl object-cover"
        />
      ) : (
        <div className="h-32 w-32 rounded-xl bg-gray-100" />
      )}
      <span className="text-center text-sm font-medium">{title}</span>
    </div>
  );
}
