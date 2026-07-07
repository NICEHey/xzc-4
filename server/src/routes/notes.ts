import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'
import { CreateNoteInput, UpdateNoteInput, NoteFilter } from '../types'

const router = Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, tagId, search, type, isFavorite, page, pageSize, sortBy, sortOrder } = req.query as unknown as NoteFilter

    const where: any = { userId: req.user!.id }

    if (bookId) {
      where.bookId = Number(bookId)
    }

    if (tagId) {
      where.tags = { some: { tagId: Number(tagId) } }
    }

    if (search) {
      where.content = { contains: search }
    }

    if (type) {
      where.type = type
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite === 'true'
    }

    const pageNum = Number(page) || 1
    const size = Number(pageSize) || 10
    const skip = (pageNum - 1) * size

    const validSortFields: Array<'createdAt' | 'updatedAt'> = ['createdAt', 'updatedAt']
    const field: 'createdAt' | 'updatedAt' = (sortBy && validSortFields.includes(sortBy)) ? sortBy : 'updatedAt'
    const direction = sortOrder === 'asc' ? 'asc' : 'desc'
    const orderBy = { [field]: direction }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: size,
        orderBy,
        include: {
          book: { select: { id: true, title: true, cover: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.note.count({ where }),
    ])

    res.json({ data: notes, total, page: pageNum, pageSize: size })
  } catch (error) {
    res.status(500).json({ error: '获取笔记列表失败' })
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findUnique({
      where: { id: Number(id), userId: req.user!.id },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true } },
        tags: { include: { tag: true } },
      },
    })

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: '获取笔记详情失败' })
  }
})

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, type, content, pageNumber, tags, isFavorite } = req.body as CreateNoteInput

    if (!bookId || !content) {
      return res.status(400).json({ error: '请填写书籍和内容' })
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId, userId: req.user!.id },
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    const note = await prisma.note.create({
      data: {
        bookId,
        userId: req.user!.id,
        type: type || 'QUOTE',
        content,
        pageNumber,
        isFavorite: isFavorite || false,
        tags: tags
          ? {
              create: tags.map((tagName) => ({
                tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName, type: 'NOTE' } } },
              })),
            }
          : undefined,
      },
      include: {
        book: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
      },
    })

    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ error: '创建笔记失败' })
  }
})

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { type, content, pageNumber, tags, isFavorite } = req.body as UpdateNoteInput

    const existingNote = await prisma.note.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!existingNote) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    const rawTags = req.body.tags as string[] | string | undefined
    const normalizedTags = rawTags === undefined 
      ? undefined 
      : Array.isArray(rawTags)
        ? rawTags.filter(Boolean)
        : rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
    
    const note = await prisma.note.update({
      where: { id: Number(id) },
      data: {
        type,
        content,
        pageNumber,
        isFavorite,
        tags: normalizedTags !== undefined
          ? {
              deleteMany: {},
              create: normalizedTags.map((tagName: string) => ({
                tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName, type: 'NOTE' } } },
              })),
            }
          : undefined,
      },
      include: {
        book: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
      },
    })

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: '更新笔记失败' })
  }
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    })

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    await prisma.note.delete({ where: { id: Number(id) } })

    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除笔记失败' })
  }
})

router.get('/:id/export', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findUnique({
      where: { id: Number(id), userId: req.user!.id },
      include: {
        book: { select: { title: true, author: true } },
      },
    })

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' })
    }

    const content = `书名：${note.book.title}
作者：${note.book.author}
类型：${note.type === 'QUOTE' ? '摘抄' : note.type === 'THOUGHT' ? '感想' : '划线'}
页码：${note.pageNumber || '未标注'}
时间：${new Date(note.createdAt).toLocaleString('zh-CN')}

内容：
${note.content}`

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="note-${note.id}.txt"`)
    res.send(content)
  } catch (error) {
    res.status(500).json({ error: '导出笔记失败' })
  }
})

export default router