"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const supabase = createClient();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single();
      setNickname(data?.nickname ?? null);
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) loadProfile(data.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setNickname(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (loading) return null;

  if (!nickname) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-ink px-4 py-2 text-[15px] font-semibold text-bg transition hover:opacity-90"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[15px]">
      <span className="font-semibold text-ink">{nickname}</span>
      <button
        onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
        className="text-muted transition hover:text-ink"
      >
        로그아웃
      </button>
    </div>
  );
}
