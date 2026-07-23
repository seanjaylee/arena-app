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
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl px-4 py-8 flex flex-col gap-6">
      <h1 className="text-xl font-bold">대결 만들기</h1>

      <div>
        <label className="block text-sm font-medium mb-1">대결 제목 (선택)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 진격의 거인 vs 강철의 연금술사, 최종 보스는?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SideFields label="작품 A" value={sideA} onChange={setSideA} />
        <SideFields label="작품 B" value={sideB} onChange={setSideB} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">대결 기간</label>
        <div className="flex gap-3">
          {[3, 7].map((d) => (
            <label
              key={d}
              className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium ${
                durationDays === d
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              <input
                type="radio"
                name="duration"
                className="hidden"
                checked={durationDays === d}
                onChange={() => setDurationDays(d as 3 | 7)}
              />
              {d}일
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-black py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "대결 등록하기"}
      </button>
    </form>
  );
}

function SideFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SideInput;
  onChange: (v: SideInput) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="작품 제목"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange({ ...value, file: e.target.files?.[0] ?? null })}
        className="text-xs"
      />
    </div>
  );
}
