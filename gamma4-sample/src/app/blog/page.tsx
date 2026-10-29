"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"
import { useState, useEffect } from "react"

const [posts, setPosts] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function fetchPosts() {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }
  fetchPosts()
}, [])

export default function BlogPage() {
  if (loading) return <div className="container mx-auto py-10 px-4">Loading...</div>

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Latest Posts</h1>
        <p className="text-muted-foreground">Stay updated with the latest insights and news.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => (
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
          <p>No posts found.</p>
        )}
      </div>
    </div>
  )
}
