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

export default router