import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookApi, noteApi } from '../api/client'
import { Book, Note, NoteType } from '../types'
import { Loading } from '../components/Loading'
import { EmptyState } from '../components/EmptyState'

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

export const BookNotes = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, notesRes] = await Promise.all([
          bookApi.getById(Number(id)),
          noteApi.getAll({ bookId: Number(id) }),
        ])
        setBook(bookRes.data)
        setNotes(notesRes.data)
      } catch (error) {
        console.error('Failed to fetch book notes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return <Loading />
  }

  if (!book) {
    return <div className="text-center py-12">书籍不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/books/${id}`)} className="text-brown-500 hover:text-brown-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书籍详情
        </button>
        <button
          onClick={() => {
            const modal = document.getElementById('add-note-modal')
            if (modal) modal.classList.remove('hidden')
          }}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors text-sm font-medium"
        >
          写笔记
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          {book.cover ? (
            <img src={book.cover} alt={book.title} className="w-20 h-24 object-cover rounded-lg" />
          ) : (
            <div className="w-20 h-24 bg-cream-100 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-brown-700">{book.title}</h1>
            <p className="text-brown-500">{book.author}</p>
            <p className="text-sm text-brown-400 mt-1">共 {notes.length} 条笔记</p>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="暂无笔记"
          description="为这本书写第一条笔记吧"
          action={{ label: '写笔记', onClick: () => document.getElementById('add-note-modal')?.classList.remove('hidden') }}
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Link key={note.id} to={`/notes/${note.id}`} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getNoteTypeClass(note.type)}`}>
                  {noteTypeLabels[note.type]}
                </span>
                {note.isFavorite && (
                  <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
              </div>
              <p className="text-brown-700 line-clamp-2 mb-3">{note.content}</p>
              <div className="flex items-center justify-between text-sm text-brown-400">
                {note.pageNumber && <span>P{note.pageNumber}</span>}
                <span>{new Date(note.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AddNoteModal bookId={Number(id)} onClose={() => {
        document.getElementById('add-note-modal')?.classList.add('hidden')
        setLoading(true)
      }} />
    </div>
  )
}

const AddNoteModal = ({ bookId, onClose }: { bookId: number; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    type: 'QUOTE' as NoteType,
    content: '',
    pageNumber: '',
    tags: '',
    isFavorite: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await noteApi.create({
        bookId,
        type: formData.type,
        content: formData.content,
        pageNumber: formData.pageNumber ? Number(formData.pageNumber) : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isFavorite: formData.isFavorite,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="add-note-modal" className="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">写笔记</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">类型</label>
            <div className="flex gap-2">
              {Object.entries(noteTypeLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: key as NoteType })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.type === key
                      ? 'bg-brown-500 text-white'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50 h-32 resize-none"
              placeholder="输入笔记内容..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">页码</label>
              <input
                type="number"
                value={formData.pageNumber}
                onChange={(e) => setFormData({ ...formData, pageNumber: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
                placeholder="可选"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">标签</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
                placeholder="逗号分隔"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="rounded border-brown-200 text-brown-500"
            />
            <label htmlFor="isFavorite" className="text-sm text-brown-600">收藏</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50">取消</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 disabled:opacity-50">
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}