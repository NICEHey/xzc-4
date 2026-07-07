import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { UpdateProfileInput } from '../types'

const router = Router()

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, email: true, avatar: true, bio: true, createdAt: true },
    })

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, avatar, bio } = req.body as UpdateProfileInput

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { username, avatar, bio },
      select: { id: true, username: true, email: true, avatar: true, bio: true },
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: '更新用户信息失败' })
  }
})

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { username } = req.query as { username?: string }

    if (!username) {
      return res.status(400).json({ error: '请提供用户名' })
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: username },
        id: { not: req.user!.id },
      },
      select: { id: true, username: true, email: true, avatar: true },
      take: 10,
    })

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: '搜索用户失败' })
  }
})

export default router