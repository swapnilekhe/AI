"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Book, Layout, User, Search } from "lucide-react"

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">BlogSphere</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">Blog</Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search" className="hidden sm:block">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="gap-2">
              <User className="h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
