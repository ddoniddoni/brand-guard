import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandGuard",
  description:
    "A brand risk review assistant for pre-publication marketing workflows.",
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
