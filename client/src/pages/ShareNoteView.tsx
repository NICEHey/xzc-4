import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { shareApi } from '../api/client'
import { Note, NoteType } from '../types'
import { Loading } from '../components/Loading'

const noteTypeLabels: Record<NoteType, string> = {
  QUOTE: '摘抄',
  THOUGHT: '感想',
  HIGHLIGHT: '划线',
}

const getNoteTypeClass = (type: NoteType) => {
  switch (type) {
    case 'QUOTE': return 'bg-blue-50 text-blue-600'
    case 'THOUGHT': return 'bg-green-50 text-green-600'
    case 'HIGHLIGHT': return 'bg-yellow-50 text-yellow-600'
  }
}

export const ShareNoteView = () => {
  const { token } = useParams<{ token: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await shareApi.getNoteByToken(token!)
        setNote(res.data)
      } catch (error: any) {
        setError(error.response?.data?.error || '无法获取分享的笔记')
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  }, [token])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-brown-700 mb-2">{error}</h2>
          <p className="text-brown-400 mb-6">分享链接可能已过期或被取消</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <p className="text-brown-400">笔记不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-brown-500 hover:text-brown-600 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享笔记
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${getNoteTypeClass(note.type)}`}>
                {noteTypeLabels[note.type]}
              </span>
              {note.isFavorite && (
                <svg className="w-6 h-6 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              {note.book?.cover ? (
                <img src={note.book.cover} alt={note.book.title} className="w-16 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-20 bg-cream-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className="text-lg font-medium text-brown-700">{note.book?.title}</h2>
                <p className="text-sm text-brown-400">{note.book?.author}</p>
              </div>
            </div>

            <div className="bg-cream-50 rounded-xl p-6 mb-6">
              <p className="text-brown-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {note.pageNumber && (
                <span className="px-3 py-1 bg-cream-100 text-brown-600 rounded-lg text-sm">
                  页码: P{note.pageNumber}
                </span>
              )}
              {note.tags?.map((nt) => (
                <span key={nt.tag.id} className="px-3 py-1 bg-cream-100 text-brown-600 rounded-lg text-sm">
                  #{nt.tag.name}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-brown-100 flex items-center justify-between text-sm text-brown-400">
              <span>创建于 {new Date(note.createdAt).toLocaleString('zh-CN')}</span>
              {note.user && (
                <span>分享者: {note.user.username}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-brown-400">这是一条分享的笔记</p>
          <p className="text-xs text-brown-300 mt-1">登录后可以创建和分享自己的笔记</p>
        </div>
      </div>
    </div>
  )
}