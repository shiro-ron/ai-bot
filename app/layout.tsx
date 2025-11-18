import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LINE Fortune Bot",
  description: "LINE Messaging API webhook and daily fortune sample (Next.js App Router)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
