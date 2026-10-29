"use client"

import React from 'react'
import { Twitter, Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-8">
            <p className="text-sm text-muted-foreground">© 2026 BlogSphere. All rights reserved.</p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary" />
              <Github className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary" />
              <Linkedin className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-8">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
