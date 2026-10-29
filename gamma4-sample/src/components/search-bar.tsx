"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"

export default function SearchBar() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", query)
    // This will be updated to navigate to the search results page
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-md">
      <Input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </form>
  )
}
