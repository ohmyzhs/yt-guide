import { Noto_Sans_KR, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "YT Guide",
  description: "개인 프롬프트 저장소와 제작 도구를 하나의 앱 셸로 통합한 제작 워크스페이스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
