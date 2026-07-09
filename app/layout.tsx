import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandGuard",
  description:
    "영상 대본, 광고 문구, 이미지 속 텍스트를 브랜드 정책 사전 기준으로 검수하는 콘텐츠 사전 검수 SaaS입니다.",
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
