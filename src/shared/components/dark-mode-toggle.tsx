import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const isDarkMode =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)

    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="
      rounded-lg 
      p-2 
      text-muted-foreground 
      hover:bg-muted 
      hover:text-foreground 
      transition-colors 
      cursor-pointer       
      outline-none 
      border-none 
    "
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )

}
