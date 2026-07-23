"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-corner-a to-corner-b text-lg font-black italic text-white shadow-xl shadow-corner-a/25">
          VS
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink">컨텐츠 아레나</h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
            A vs B, 넌 어느 편?
            <br />내가 사랑하는 작품, 너도 보게 만든다.
          </p>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-3.5 font-semibold text-ink shadow-lg transition hover:bg-surface-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-.96 2.6-2.05 3.4v2.8h3.32C20.66 18.5 21.6 15.6 21.6 12.2c0-.8-.07-1.5-.2-2.2H12z" />
          <path fill="#34A853" d="M12 21.6c2.7 0 4.96-.9 6.62-2.4l-3.32-2.8c-.9.6-2.05 1-3.3 1-2.55 0-4.7-1.7-5.48-4.05H3.1v2.9C4.75 19.3 8.1 21.6 12 21.6z" />
          <path fill="#4A90D9" d="M6.52 13.35c-.2-.6-.32-1.25-.32-1.95s.12-1.35.32-1.95V6.55H3.1C2.4 7.95 2 9.55 2 11.4s.4 3.45 1.1 4.85l3.42-2.9z" />
          <path fill="#FBBC05" d="M12 5.4c1.47 0 2.78.5 3.82 1.5l2.86-2.86C16.96 2.4 14.7 1.4 12 1.4 8.1 1.4 4.75 3.7 3.1 7.05L6.52 9.95C7.3 7.6 9.45 5.4 12 5.4z" />
        </svg>
        Google로 시작하기
      </button>
    </div>
  );
}
