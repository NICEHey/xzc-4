import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        bookTags: { select: { bookId: true } },
        noteTags: { select: { noteId: true } },
      },
    })

    const result = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      type: tag.type,
      bookCount: tag.bookTags.length,
      noteCount: tag.noteTags.length,
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: '获取标签列表失败' })
  }
})

router.get('/:id/books', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const books = await prisma.book.findMany({
      where: { userId: req.user!.id, tags: { some: { tagId: Number(id) } } },
      include: {
        tags: { include: { tag: true } },
        notes: { select: { id: true } },
      },
    })

    res.json(books)
  } catch (error) {
    res.status(500).json({ error: '获取标签关联书籍失败' })
  }
})

router.get('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const notes = await prisma.note.findMany({
      where: { userId: req.user!.id, tags: { some: { tagId: Number(id) } } },
      include: {
        book: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
      },
    })

    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: '获取标签关联笔记失败' })
  }
})

export default router