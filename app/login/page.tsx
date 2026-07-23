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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">컨텐츠 아레나</h1>
      <p className="text-sm text-gray-500">A vs B, 넌 어느 편?</p>
      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Google로 로그인
      </button>
    </div>
  );
}
