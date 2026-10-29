import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPosts = async (req: Request, res: Response) => {
  const { categoryId, search } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        categoryId: categoryId ? Number(categoryId) : undefined,
        title: { contains: search as string, mode: 'insensitive' },
      },
      include: { category: true, author: { select: { fullName: true } } },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, summary, categoryId, imageUrl } = req.body;
  const authorId = (req.user as any).id;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        summary,
        categoryId: Number(categoryId),
        imageUrl,
        authorId,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({ where: { id: Number(id) } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
