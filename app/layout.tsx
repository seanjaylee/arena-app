import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AuthButton from "@/components/AuthButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "컨텐츠 아레나",
  description: "내가 사랑하는 작품, 너도 보게 만든다 — 취향 배틀 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <header className="sticky top-0 z-20 border-b border-line-soft bg-bg/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-corner-a to-corner-b text-[11px] font-black italic text-white shadow-lg shadow-corner-a/20">
                VS
              </span>
              <span className="text-[15px] font-bold tracking-tight text-ink">
                컨텐츠 아레나
              </span>
            </Link>
            <AuthButton />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
