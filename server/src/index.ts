import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import usersRouter from './routes/users'
import booksRouter from './routes/books'
import notesRouter from './routes/notes'
import progressRouter from './routes/progress'
import tagsRouter from './routes/tags'
import statsRouter from './routes/stats'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)
app.use('/api/notes', notesRouter)
app.use('/api/progress', progressRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/stats', statsRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '书摘 API 运行正常' })
})

app.listen(PORT, () => {
  console.log(`书摘后端服务运行在 http://localhost:${PORT}`)
})