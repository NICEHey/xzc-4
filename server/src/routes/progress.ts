import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { CreateReadingProgressInput, UpdateReadingProgressInput } from '../types'

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
      data: { 
        bookId, 
        userId: req.user!.id,
        page, 
        percentage, 
        durationMinutes 
      },
    })

    res.status(201).json(progress)
  } catch (error) {
    res.status(500).json({ error: '记录阅读进度失败' })
  }
})

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, page, percentage, durationMinutes, timestamp } = req.body as UpdateReadingProgressInput

    if (!bookId) {
      return res.status(400).json({ error: '请选择书籍' })
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId, userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const existingProgress = await prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId: req.user!.id, bookId } },
    })

    if (existingProgress) {
      if (timestamp && existingProgress.updatedAt) {
        const serverTimestamp = new Date(existingProgress.updatedAt).getTime()
        if (timestamp < serverTimestamp) {
          return res.status(409).json({ error: '进度已过期，请刷新后重试' })
        }
      }

      if (page !== undefined && existingProgress.page !== null && page < existingProgress.page) {
        return res.status(409).json({ error: '进度已过期，请刷新后重试' })
      }

      if (percentage !== undefined && existingProgress.percentage !== null && percentage < existingProgress.percentage) {
        return res.status(409).json({ error: '进度已过期，请刷新后重试' })
      }
    }

    const progress = await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: req.user!.id, bookId } },
      update: {
        page,
        percentage,
        durationMinutes,
      },
      create: {
        userId: req.user!.id,
        bookId,
        page,
        percentage,
        durationMinutes,
      },
    })

    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: '更新阅读进度失败' })
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
