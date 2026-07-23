"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SideInput = {
  title: string;
  file: File | null;
};

export default function CreateArenaForm() {
  const supabase = createClient();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState("");
  const [sideA, setSideA] = useState<SideInput>({ title: "", file: null });
  const [sideB, setSideB] = useState<SideInput>({ title: "", file: null });
  const [durationDays, setDurationDays] = useState<3 | 7>(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [supabase, router]);

  const uploadImage = async (file: File, userId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("arena-images")
      .upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("arena-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sideA.title.trim() || !sideB.title.trim()) {
      setError("A/B 작품 제목을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const [sideAImage, sideBImage] = await Promise.all([
        sideA.file ? uploadImage(sideA.file, user.id) : Promise.resolve(null),
        sideB.file ? uploadImage(sideB.file, user.id) : Promise.resolve(null),
      ]);

      const endAt = new Date();
      endAt.setDate(endAt.getDate() + durationDays);

      const { data: arena, error: insertError } = await supabase
        .from("arenas")
        .insert({
          title: title.trim() || null,
          side_a_title: sideA.title.trim(),
          side_a_image: sideAImage,
          side_b_title: sideB.title.trim(),
          side_b_image: sideBImage,
          creator_id: user.id,
          end_at: endAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/arena/${arena.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대결 생성 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) return null;

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">대결 만들기</h1>
        <p className="mt-1 text-[15px] text-muted">두 작품을 링에 올리고 투표를 받아보세요.</p>
      </div>

      {/* 대진 카드 */}
      <div className="relative flex items-stretch gap-3 rounded-2xl border border-line bg-surface p-4">
        <SideFields corner="a" value={sideA} onChange={setSideA} />
        <div className="absolute left-1/2 top-[38%] z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-bg text-[11px] font-black italic text-ink shadow-xl">
          VS
        </div>
        <SideFields corner="b" value={sideB} onChange={setSideB} />
      </div>

      {/* 대결 제목 */}
      <div>
        <label className="mb-1.5 block text-[15px] font-semibold text-ink">
          대결 제목 <span className="font-normal text-faint">(선택)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 최종 보스는 누가 더 강한가?"
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-faint focus:border-ink-soft focus:outline-none"
        />
        <p className="mt-1.5 text-[13px] text-faint">비워두면 &quot;A vs B&quot; 형태로 자동 생성돼요.</p>
      </div>

      {/* 기간 */}
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-ink">대결 기간</label>
        <div className="flex gap-3">
          {[3, 7].map((d) => (
            <label
              key={d}
              className={`flex-1 cursor-pointer rounded-xl border px-4 py-3.5 text-center text-[15px] font-semibold transition ${
                durationDays === d
                  ? "border-ink bg-ink text-bg"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="duration"
                className="hidden"
                checked={durationDays === d}
                onChange={() => setDurationDays(d as 3 | 7)}
              />
              {d}일간
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-corner-a/30 bg-corner-a/10 px-4 py-3 text-[15px] text-corner-a-soft">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-gradient-to-r from-corner-a to-corner-b py-4 text-base font-bold text-white shadow-lg shadow-corner-a/20 transition hover:opacity-95 disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "대결 등록하기"}
      </button>
    </form>
  );
}

function SideFields({
  corner,
  value,
  onChange,
}: {
  corner: "a" | "b";
  value: SideInput;
  onChange: (v: SideInput) => void;
}) {
  const isA = corner === "a";
  const tag = isA ? "text-corner-a" : "text-corner-b";
  const ring = isA ? "border-corner-a/40" : "border-corner-b/40";
  const preview = value.file ? URL.createObjectURL(value.file) : null;

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className={`text-[11px] font-black uppercase tracking-widest ${tag}`}>
        {isA ? "Red Corner" : "Blue Corner"}
      </span>

      <label
        className={`relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed ${ring} bg-bg transition hover:bg-surface-2`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="미리보기" className="h-full w-full object-cover" />
        ) : (
          <span className="text-center text-[13px] font-medium text-faint">
            이미지
            <br />
            추가
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange({ ...value, file: e.target.files?.[0] ?? null })}
          className="hidden"
        />
      </label>

      <input
        type="text"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="작품 제목"
        className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-center text-[15px] text-ink placeholder:text-faint focus:border-ink-soft focus:outline-none"
      />
    </div>
  );
}
