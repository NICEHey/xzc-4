import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { CreateReadingProgressInput } from '../types'

const router = Router()

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, page, percentage, durationMinutes } = req.body as CreateReadingProgressInput

    if (!bookId) {
      return res.status(400).json({ error: '请选择书籍' })
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId, userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const progress = await prisma.readingProgress.create({
      data: { bookId, page, percentage, durationMinutes },
    })

    res.status(201).json(progress)
  } catch (error) {
    res.status(500).json({ error: '记录阅读进度失败' })
  }
})

router.get('/book/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params

    const book = await prisma.book.findUnique({
      where: { id: Number(bookId), userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const progress = await prisma.readingProgress.findMany({
      where: { bookId: Number(bookId) },
      orderBy: { createdAt: 'desc' },
    })

    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: '获取阅读进度失败' })
  }
})

export default router