import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '未授权访问' })
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的令牌' })
    }
    req.user = user as UserPayload
    next()
  })
}