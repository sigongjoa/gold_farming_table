"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { CharacterSelectionProvider } from "@/lib/contexts/character-selection-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// Metadata는 서버 컴포넌트에서만 내보낼 수 있으므로, 클라이언트 컴포넌트인 layout.tsx에서는 주석 처리하거나 제거해야 합니다.
// export const metadata: Metadata = {
//   title: "마비노기 제작 계산기",
//   description: "마비노기 게임을 위한 제작 계산기 및 캐릭터 관리 도구",
//     generator: 'v0.dev'
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.debug('RootLayout: Entering layout component');
  const pathname = usePathname();
  console.debug(`현재 경로: ${pathname}`);

  console.debug('RootLayout: Exiting layout component rendering');
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="mabinogi-theme">
          <CharacterSelectionProvider>
            <div className="min-h-screen bg-background p-4 md:p-6">
              <Card className="max-w-6xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl md:text-3xl font-bold">마비노기 제작 계산기</CardTitle>
                  <ModeToggle />
                </CardHeader>
                <CardContent>
                  <nav className="mb-6">
                    <div className="flex flex-nowrap h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full space-x-2 overflow-x-auto"> {/* TabsList처럼 보이도록 스타일링 */}
                      <Link href="/" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname === "/" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        서버 및 캐릭터
                      </Link>
                      <Link href="/inventory" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/inventory") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        아이템
                      </Link>
                      <Link href="/quests" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/quests") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        숙제
                      </Link>
                      <Link href="/character-tasks" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/character-tasks") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        캐릭터 작업
                      </Link>
                      <Link href="/crafting" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/crafting") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        크래프팅
                      </Link>
                      <Link href="/equipped-items" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/equipped-items") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        착용 아이템
                      </Link>
                      <Link href="/introduction" className={"px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground " + (pathname.startsWith("/introduction") ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        프로젝트 소개
                      </Link>
                    </div>
                  </nav>
                  {children}
                </CardContent>
              </Card>
            </div>
          </CharacterSelectionProvider>
        </ThemeProvider>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9748246495635080"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
