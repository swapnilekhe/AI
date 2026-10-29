"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for now, will be replaced by Prisma queries
const post = {
  id: "1",
  title: "The Future of AI in Web Development",
  content: "AI is rapidly changing the landscape of web development. From automated code generation to intelligent user interfaces, the possibilities are endless...",
  excerpt: "Exploring how AI is reshaping the way we build and deploy web applications...",
  category: "Technology",
  date: "2026-10-25",
  slug: "future-of-ai-web-dev"
}

export default function BlogPostPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge variant="secondary">{post.category}</Badge>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p className="text-muted-foreground">{post.date}</p>
        </div>
        <div className="prose prose-lg max-w-none">
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  )
}
