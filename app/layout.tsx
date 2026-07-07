import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandGuard",
  description:
    "마케팅 소재 공개 전 AI 1차 검토와 사람 중심 결재를 연결하는 브랜드 리스크 검토 SaaS입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  const storedTheme = window.localStorage.getItem("brandguard.theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : prefersDark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
} catch {}
`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
