import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "일그람",
  description: "조부모와 손주의 연락을 돕는 가족 정원 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f6efe3]">
        {children}
      </body>
    </html>
  );
}
