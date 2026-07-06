import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { RegisterInput, LoginInput } from '../types'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body as RegisterInput

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写完整信息' })
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    })

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({ user, token })
  } catch (error) {
    res.status(500).json({ error: '注册失败，请稍后重试' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as LoginInput

    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return res.status(400).json({ error: '邮箱或密码错误' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
      token,
    })
  } catch (error) {
    res.status(500).json({ error: '登录失败，请稍后重试' })
  }
})

export default router