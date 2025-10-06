"use client"

import { Moon, Sun, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "orange">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "orange" | null
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      const initialTheme = savedTheme || systemTheme

      setTheme(initialTheme)
      document.documentElement.classList.remove("light", "dark", "orange")
      document.documentElement.classList.add(initialTheme)
    }
  }, [])

  const changeTheme = (newTheme: "light" | "dark" | "orange") => {
    if (typeof window !== "undefined") {
      setTheme(newTheme)
      localStorage.setItem("theme", newTheme)
      document.documentElement.classList.remove("light", "dark", "orange")
      document.documentElement.classList.add(newTheme)
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === "light" && <Sun className="h-4 w-4" />}
          {theme === "dark" && <Moon className="h-4 w-4" />}
          {theme === "orange" && <Palette className="h-4 w-4" />}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("orange")}>
          <Palette className="mr-2 h-4 w-4" />
          Laranja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
