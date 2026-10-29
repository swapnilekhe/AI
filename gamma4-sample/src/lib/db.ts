import prisma from "./prisma"

export async function getPosts() {
  return await prisma.post.findMany({
    where: { published: true },
    include: { category: true, tags: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: { category: true, tags: true },
  })
}

export async function getPostsByCategory(categoryId: string) {
  return await prisma.post.findMany({
    where: { categoryId: categoryId, published: true },
    include: { category: true, tags: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function searchPosts(query: string) {
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
    }),
    prisma.category.findMany(),
  ])

  return { posts, categories }
}
