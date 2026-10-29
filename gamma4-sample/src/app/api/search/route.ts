import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""

  try {
    const [posts, categories] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { category: true, tags: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany(),
    ])

    return NextResponse.json({ posts, categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 })
  }
}
