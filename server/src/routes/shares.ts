import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = Router()

const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { noteId, isPublic, sharedUserId, expiresAt } = req.body

    const note = await prisma.note.findUnique({
      where: { id: Number(noteId), userId: req.user!.id },
    })

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    const shareToken = generateShareToken()

    if (isPublic) {
      await prisma.note.update({
        where: { id: Number(noteId) },
        data: { isShared: true, shareToken },
      })
    }

    const share = await prisma.noteShare.create({
      data: {
        noteId: Number(noteId),
        userId: req.user!.id,
        sharedUserId: sharedUserId ? Number(sharedUserId) : null,
        shareToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        note: {
          include: {
            book: { select: { id: true, title: true, author: true, cover: true } },
            tags: { include: { tag: true } },
          },
        },
        user: { select: { id: true, username: true } },
        sharedUser: { select: { id: true, username: true } },
      },
    })

    res.status(201).json(share)
  } catch (error) {
    res.status(500).json({ error: '创建分享失败' })
  }
})

router.get('/public', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { isShared: true },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true } },
        tags: { include: { tag: true } },
        user: { select: { id: true, username: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: '获取公开分享列表失败' })
  }
})

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params

    const share = await prisma.noteShare.findUnique({
      where: { shareToken: token },
      include: {
        note: {
          include: {
            book: { select: { id: true, title: true, author: true, cover: true } },
            tags: { include: { tag: true } },
          },
        },
        user: { select: { id: true, username: true } },
        sharedUser: { select: { id: true, username: true } },
      },
    })

    if (!share) {
      return res.status(404).json({ error: '分享链接不存在' })
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(403).json({ error: '分享链接已过期' })
    }

    res.json(share)
  } catch (error) {
    res.status(500).json({ error: '获取分享笔记失败' })
  }
})

router.delete('/:token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params

    const share = await prisma.noteShare.findUnique({
      where: { shareToken: token },
    })

    if (!share) {
      return res.status(404).json({ error: '分享不存在' })
    }

    if (share.userId !== req.user!.id) {
      return res.status(403).json({ error: '无权取消此分享' })
    }

    await prisma.noteShare.delete({
      where: { shareToken: token },
    })

    const remainingShares = await prisma.noteShare.count({
      where: { noteId: share.noteId },
    })

    if (remainingShares === 0) {
      await prisma.note.update({
        where: { id: share.noteId },
        data: { isShared: false, shareToken: null },
      })
    }

    res.json({ message: '取消分享成功' })
  } catch (error) {
    res.status(500).json({ error: '取消分享失败' })
  }
})

router.get('/note/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params

    const note = await prisma.note.findUnique({
      where: { id: Number(noteId), userId: req.user!.id },
    })

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    const shares = await prisma.noteShare.findMany({
      where: { noteId: Number(noteId) },
      include: {
        sharedUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(shares)
  } catch (error) {
    res.status(500).json({ error: '获取分享记录失败' })
  }
})

export default router