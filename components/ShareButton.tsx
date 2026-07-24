"use client";

import { useState } from "react";
import type { Side } from "@/lib/types";

export default function ShareButton({
  title,
  labelA,
  labelB,
  mySide,
}: {
  title: string;
  labelA: string;
  labelB: string;
  mySide: Side | null;
}) {
  const [copied, setCopied] = useState(false);
  const hasVoted = mySide !== null;
  const mySideLabel = mySide === "A" ? labelA : mySide === "B" ? labelB : "";

  const ctaLabel = hasVoted ? "우리 편 초대하기" : "친구한테 물어보기";

  const shareText = hasVoted
    ? `"${title}" — 난 ${mySideLabel}에 한 표! 우리 편 도와줘 🔥`
    : `"${title}" 🤔 ${labelA} vs ${labelB}, 넌 어느 편? 투표하고 알려줘!`;

  const copyText = async (text: string) => {
    // 1) 최신 클립보드 API (보안 컨텍스트, 사용자 제스처 필요)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // 다음 폴백으로
    }
    // 2) 구형 폴백 (iframe 등 제한 환경에서도 대체로 동작)
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    // 모바일 등 네이티브 공유 시트 지원 시 우선 사용
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "컨텐츠 아레나", text: shareText, url });
        return;
      } catch {
        // 사용자가 취소했거나 실패 → 복사로 폴백
      }
    }

    // 폴백: 링크(URL)만 복사
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold transition active:scale-[0.99] ${
        hasVoted
          ? "bg-gradient-to-r from-corner-a to-corner-b text-white shadow-lg shadow-corner-a/20 hover:opacity-95"
          : "border border-line bg-surface text-ink hover:bg-surface-2"
      }`}
    >
      {copied ? (
        <>✓ 링크가 복사됐어요!</>
      ) : (
        <>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
            <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
          </svg>
          {ctaLabel}
        </>
      )}
    </button>
  );
}
