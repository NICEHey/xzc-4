import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic, cover } = req.body

    if (!name) {
      return res.status(400).json({ error: '请填写书单名称' })
    }

    const bookList = await prisma.bookList.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        cover,
        userId: req.user!.id,
      },
    })

    res.status(201).json(bookList)
  } catch (error) {
    res.status(500).json({ error: '创建书单失败' })
  }
})

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookLists = await prisma.bookList.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        books: {
          select: { id: true },
        },
      },
    })

    const result = bookLists.map((list) => ({
      ...list,
      bookCount: list.books.length,
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: '获取书单列表失败' })
  }
})

router.get('/public', async (req, res) => {
  try {
    const bookLists = await prisma.bookList.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        books: {
          select: { id: true },
        },
        user: {
          select: { id: true, username: true },
        },
      },
    })

    const result = bookLists.map((list) => ({
      ...list,
      bookCount: list.books.length,
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: '获取公开书单失败' })
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const bookList = await prisma.bookList.findUnique({
      where: { id: Number(id) },
      include: {
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                cover: true,
                status: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        user: {
          select: { id: true, username: true },
        },
      },
    })

    if (!bookList) {
      return res.status(404).json({ error: '书单不存在' })
    }

    if (bookList.userId !== req.user!.id && !bookList.isPublic) {
      return res.status(403).json({ error: '无权访问此书单' })
    }

    const books = bookList.books.map((blb) => blb.book)

    res.json({
      ...bookList,
      books,
      bookCount: books.length,
    })
  } catch (error) {
    res.status(500).json({ error: '获取书单详情失败' })
  }
})

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, isPublic, cover } = req.body

    const bookList = await prisma.bookList.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!bookList) {
      return res.status(404).json({ error: '书单不存在' })
    }

    const updatedBookList = await prisma.bookList.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        isPublic,
        cover,
      },
    })

    res.json(updatedBookList)
  } catch (error) {
    res.status(500).json({ error: '更新书单失败' })
  }
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const bookList = await prisma.bookList.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!bookList) {
      return res.status(404).json({ error: '书单不存在' })
    }

    await prisma.bookList.delete({
      where: { id: Number(id) },
    })

    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除书单失败' })
  }
})

router.post('/:id/books', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { bookId } = req.body

    if (!bookId) {
      return res.status(400).json({ error: '请提供书籍ID' })
    }

    const bookList = await prisma.bookList.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!bookList) {
      return res.status(404).json({ error: '书单不存在' })
    }

    const book = await prisma.book.findUnique({
      where: { id: Number(bookId), userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const existing = await prisma.bookListBook.findUnique({
      where: { bookListId_bookId: { bookListId: Number(id), bookId: Number(bookId) } },
    })

    if (existing) {
      return res.status(400).json({ error: '书籍已在书单中' })
    }

    const count = await prisma.bookListBook.count({
      where: { bookListId: Number(id) },
    })

    const bookListBook = await prisma.bookListBook.create({
      data: {
        bookListId: Number(id),
        bookId: Number(bookId),
        orderIndex: count,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            cover: true,
            status: true,
          },
        },
      },
    })

    res.status(201).json(bookListBook)
  } catch (error) {
    res.status(500).json({ error: '添加书籍失败' })
  }
})

router.delete('/:id/books/:bookId', authenticateToken, async (req, res) => {
  try {
    const { id, bookId } = req.params

    const bookList = await prisma.bookList.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!bookList) {
      return res.status(404).json({ error: '书单不存在' })
    }

    const bookListBook = await prisma.bookListBook.findUnique({
      where: { bookListId_bookId: { bookListId: Number(id), bookId: Number(bookId) } },
    })

    if (!bookListBook) {
      return res.status(404).json({ error: '书籍不在此书单中' })
    }

    await prisma.bookListBook.delete({
      where: { id: bookListBook.id },
    })

    res.json({ message: '移除成功' })
  } catch (error) {
    res.status(500).json({ error: '移除书籍失败' })
  }
})

export default router