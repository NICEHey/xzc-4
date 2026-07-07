import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { noteApi, bookApi, tagApi } from '../api/client'
import { Note, Book, Tag, NoteType } from '../types'
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

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [bookId, setBookId] = useState(searchParams.get('bookId') ? Number(searchParams.get('bookId')) : undefined)
  const [tagId, setTagId] = useState(searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined)
  const [type, setType] = useState<NoteType | 'ALL'>((searchParams.get('type') as NoteType) || 'ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [notesRes, booksRes, tagsRes] = await Promise.all([
          noteApi.getAll({ bookId, tagId, search, type: type === 'ALL' ? undefined : type, page, pageSize }),
          bookApi.getAll(),
          tagApi.getAll(),
        ])
        setNotes(notesRes.data.data)
        setTotal(notesRes.data.total)
        setBooks(booksRes.data)
        setTags(tagsRes.data)
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bookId, tagId, search, type, page])

  useEffect(() => {
    setPage(1)
  }, [bookId, tagId, search, type])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (bookId) params.bookId = bookId.toString()
    if (tagId) params.tagId = tagId.toString()
    if (search) params.search = search
    if (type !== 'ALL') params.type = type
    setSearchParams(params)
  }, [bookId, tagId, search, type, setSearchParams])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brown-700">笔记</h1>
        <button
          onClick={() => document.getElementById('add-note-modal')?.classList.remove('hidden')}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors text-sm font-medium"
        >
          写笔记
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索笔记内容..."
            className="w-full px-4 py-2 pl-10 border border-brown-200 rounded-lg bg-cream-50"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-brown-400">书籍：</span>
            <select
              value={bookId || ''}
              onChange={(e) => setBookId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 border border-brown-200 rounded-lg bg-cream-50 text-sm"
            >
              <option value="">全部书籍</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>{book.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-brown-400">类型：</span>
            {[...Object.entries(noteTypeLabels), ['ALL', '全部']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setType(key as NoteType | 'ALL')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  type === key
                    ? 'bg-brown-500 text-white'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-brown-400">标签：</span>
            <button
              onClick={() => setTagId(undefined)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                !tagId ? 'bg-brown-500 text-white' : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
              }`}
            >
              全部
            </button>
            {tags.filter(t => t.type === 'NOTE').map((tag) => (
              <button
                key={tag.id}
                onClick={() => setTagId(tag.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  tagId === tag.id ? 'bg-brown-500 text-white' : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {tag.name} ({tag.noteCount})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-brown-400">共 {total} 条笔记</div>

      {notes.length === 0 ? (
        <EmptyState
          title={search ? '未找到匹配的笔记' : '暂无笔记'}
          description={search ? '尝试使用其他关键词搜索' : '记录你的第一个读书笔记吧'}
          action={{ label: '写笔记', onClick: () => document.getElementById('add-note-modal')?.classList.remove('hidden') }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
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
              <p className="text-brown-700 line-clamp-3 mb-3">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {note.book?.cover ? (
                    <img src={note.book.cover} alt={note.book.title} className="w-8 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-10 bg-cream-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-brown-600">{note.book?.title}</p>
                    <p className="text-xs text-brown-400">
                      {note.pageNumber && `P${note.pageNumber} · `}
                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-brown-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-50"
          >
            上一页
          </button>
          <span className="text-sm text-brown-500">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</span>
          <button
            onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-3 py-1.5 border border-brown-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-50"
          >
            下一页
          </button>
        </div>
      </div>

      <AddNoteModal onClose={() => {
        document.getElementById('add-note-modal')?.classList.add('hidden')
        setLoading(true)
      }} />
    </div>
  )
}

const AddNoteModal = ({ onClose }: { onClose: () => void }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [formData, setFormData] = useState({
    bookId: '',
    type: 'QUOTE' as NoteType,
    content: '',
    pageNumber: '',
    tags: '',
    isFavorite: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await bookApi.getAll()
      setBooks(res.data)
    }
    fetchBooks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await noteApi.create({
        bookId: Number(formData.bookId),
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-brown-600 mb-1">书籍 *</label>
            <select
              value={formData.bookId}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              required
            >
              <option value="">选择书籍</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>{book.title}</option>
              ))}
            </select>
          </div>

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