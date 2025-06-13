"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  console.debug('ModeToggle 함수 진입');
  const { setTheme } = useTheme()
  console.debug(`setTheme 함수: ${setTheme}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">테마 변경</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          console.debug('라이트 테마 선택');
          setTheme("light")
        }}>라이트</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.debug('다크 테마 선택');
          setTheme("dark")
        }}>다크</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.debug('시스템 테마 선택');
          setTheme("system")
        }}>시스템</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
console.debug('ModeToggle 함수 종료');
