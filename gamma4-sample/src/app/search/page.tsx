"use client"

import React from 'react'
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState({ posts: [], categories: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults({ posts: [], categories: [] })
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Failed to fetch search results:", error)
      } finally {
        setLoading(false)
      }
    }
    const timeout = setTimeout(() => {
      if (query.length > 2) {
        fetchResults()
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">Showing results for: "{query}"</p>
      </div>
      <div className="relative max-w-md mb-8">
        <Input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="text-muted-foreground">Loading results...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.posts.length > 0 ? (
            results.posts.map((post: any) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <Badge variant="secondary">{post.category?.name}</Badge>
                  </div>
                  <CardDescription>{post.createdAt?.toISOString().split('T')[0]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-primary font-medium flex items-center gap-1">
                    Read More <BookOpen className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No results found for "{query}".</p>
          )}
        </div>
      )}
    </div>
  )
}
