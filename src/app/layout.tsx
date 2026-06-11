import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "毕业祝福墙",
  description: "同窗数载，情谊长存 — 留下你最真挚的毕业祝福",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-graduation min-h-[100dvh]">
        <div className="bg-layer" />
        <div className="bg-overlay" />
        {children}
      </body>
    </html>
  );
}
