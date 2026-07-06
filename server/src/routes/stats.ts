import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { StatsResponse } from '../types'

const router = Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)

    const thisYearFinished = await prisma.book.count({
      where: {
        userId: req.user!.id,
        status: 'FINISHED',
        updatedAt: { gte: startOfYear },
      },
    })

    const readingNow = await prisma.book.count({
      where: { userId: req.user!.id, status: 'READING' },
    })

    const totalNotes = await prisma.note.count({ where: { userId: req.user!.id } })

    const progressRecords = await prisma.readingProgress.findMany({
      where: {
        book: { userId: req.user!.id },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'asc' },
    })

    let consecutiveDays = 0
    const dates = new Set(
      progressRecords.map((p) => new Date(p.createdAt).toDateString())
    )
    const sortedDates = Array.from(dates).sort()
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i])
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - consecutiveDays)
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++
      } else {
        break
      }
    }

    const monthlyReading = await prisma.book.findMany({
      where: {
        userId: req.user!.id,
        status: 'FINISHED',
        updatedAt: { gte: startOfYear },
      },
      select: { updatedAt: true },
    })

    const monthlyCount: Record<string, number> = {}
    for (let i = 1; i <= 12; i++) {
      monthlyCount[i.toString().padStart(2, '0')] = 0
    }
    monthlyReading.forEach((book) => {
      const month = new Date(book.updatedAt).getMonth() + 1
      monthlyCount[month.toString().padStart(2, '0')]++
    })

    const monthlyReadingResult = Object.entries(monthlyCount).map(([month, count]) => ({
      month: `${currentYear}-${month}`,
      count,
    }))

    const categoryDistribution = await prisma.bookTag.groupBy({
      by: ['tagId'],
      where: { book: { userId: req.user!.id } },
      _count: { tagId: true },
      orderBy: { _count: { tagId: 'desc' } },
      take: 10,
    })

    const tagIds = categoryDistribution.map((cd) => cd.tagId)
    const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } })
    const tagMap = new Map(tags.map((t) => [t.id, t.name]))

    const categoryDistributionResult = categoryDistribution.map((cd) => ({
      tag: tagMap.get(cd.tagId) || '未知',
      count: cd._count.tagId,
    }))

    const ratingDistribution = await prisma.book.groupBy({
      by: ['rating'],
      where: { userId: req.user!.id, rating: { gt: 0 } },
      _count: { rating: true },
      orderBy: { rating: 'asc' },
    })

    const ratingDistributionResult = ratingDistribution
      .filter((rd) => rd.rating !== null)
      .map((rd) => ({
        rating: rd.rating!,
        count: rd._count.rating,
      }))

    const totalReadingMinutes = await prisma.readingProgress.aggregate({
      _sum: { durationMinutes: true },
      where: { book: { userId: req.user!.id } },
    })

    const stats: StatsResponse = {
      thisYearFinished,
      readingNow,
      totalNotes,
      consecutiveDays,
      monthlyReading: monthlyReadingResult,
      categoryDistribution: categoryDistributionResult,
      ratingDistribution: ratingDistributionResult,
      totalReadingMinutes: totalReadingMinutes._sum.durationMinutes || 0,
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

export default router