import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { CreateBookInput, UpdateBookInput, BookFilter } from '../types'

const router = Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'ALL', tagId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as unknown as BookFilter

    const where: any = { userId: req.user!.id }

    if (status !== 'ALL') {
      where.status = status
    }

    if (tagId) {
      where.tags = { some: { tagId: Number(tagId) } }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ]
    }

    const orderBy: any = { [sortBy]: sortOrder }

    const books = await prisma.book.findMany({
      where,
      orderBy,
      include: {
        tags: { include: { tag: true } },
        notes: { select: { id: true } },
        progress: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    res.json(books)
  } catch (error) {
    res.status(500).json({ error: '获取书籍列表失败' })
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const book = await prisma.book.findUnique({
      where: { id: Number(id), userId: req.user!.id },
      include: {
        tags: { include: { tag: true } },
        notes: { select: { id: true } },
        progress: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    res.json(book)
  } catch (error) {
    res.status(500).json({ error: '获取书籍详情失败' })
  }
})

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, author, cover, publisher, publishDate, isbn, totalPages, status, rating, tags } = req.body as CreateBookInput

    if (!title || !author) {
      return res.status(400).json({ error: '请填写书名和作者' })
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        cover,
        publisher,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        isbn,
        totalPages,
        status: status || 'WANT_TO_READ',
        rating: rating || 0,
        userId: req.user!.id,
        tags: tags
          ? {
              create: tags.map((tagName) => ({
                tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName, type: 'BOOK' } } },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    })

    res.status(201).json(book)
  } catch (error) {
    res.status(500).json({ error: '添加书籍失败' })
  }
})

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, author, cover, publisher, publishDate, isbn, totalPages, status, rating, tags } = req.body as UpdateBookInput

    const existingBook = await prisma.book.findUnique({
      where: { id: Number(id), userId: req.user!.id },
      include: { tags: true },
    })

    if (!existingBook) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const book = await prisma.book.update({
      where: { id: Number(id) },
      data: {
        title,
        author,
        cover,
        publisher,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        isbn,
        totalPages,
        status,
        rating,
        tags: tags
          ? {
              deleteMany: {},
              create: tags.map((tagName) => ({
                tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName, type: 'BOOK' } } },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    })

    res.json(book)
  } catch (error) {
    res.status(500).json({ error: '更新书籍失败' })
  }
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const book = await prisma.book.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    await prisma.$transaction([
      prisma.note.deleteMany({ where: { bookId: Number(id) } }),
      prisma.readingProgress.deleteMany({ where: { bookId: Number(id) } }),
      prisma.bookTag.deleteMany({ where: { bookId: Number(id) } }),
      prisma.book.delete({ where: { id: Number(id) } }),
    ])

    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除书籍失败' })
  }
})

export default router