// src/shared/components/ui/search-input.tsx

import { useEffect, useState } from "react"
import { Input } from "@/shared/components/ui/input"
import { Search } from "lucide-react"
import { useDebounce } from "@/shared/hooks/use-debounce"

interface SearchInputProps {
  onSearch: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("")
  const debounced = useDebounce(query, 350)

  // dispara búsqueda cuando el valor está debounced
  useEffect(() => {
    onSearch(debounced.trim())
  }, [debounced])

  return (
    <div className="relative w-64 bg-white dark:bg-input/30">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar cliente..."
        className="pl-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        
      />
    </div>
  )
}
