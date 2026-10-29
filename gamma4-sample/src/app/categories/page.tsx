"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for now, will be replaced by Prisma queries
const posts = [
  {
    id: "1",
    title: "The Future of AI in Web Development",
    excerpt: "Exploring how AI is reshaping the way we build and deploy web applications...",
    category: "Technology",
    date: "2026-10-25",
    slug: "future-of-ai-web-dev"
  },
  {
    id: "2",
    title: "Mastering Next.js 15",
    excerpt: "A deep dive into the latest features and performance optimizations in Next.js...",
    category: "Development",
    date: "2026-10-24",
    slug: "mastering-nextjs-15"
  },
  {
    id: "3",
    title: "Designing for Accessibility",
    excerpt: "Why inclusive design is not just a choice, but a necessity for modern web apps...",
    category: "Design",
    date: "2026-10-23",
    slug: "designing-for-accessibility"
  },
]

export default function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const categories = ["Technology", "Development", "Design"]

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory)
    : posts

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">Browse posts by category.</p>
      </div>
      <div className="flex gap-2 mb-8 flex-wrap">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full border ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
                <CardDescription>{post.date}</CardDescription>
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
          <p className="text-muted-foreground">No posts found in this category.</p>
        )}
      </div>
    </div>
  )
}
