import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bookApi, tagApi } from '../api/client'
import { Book, Tag, BookStatus } from '../types'
import { Loading } from '../components/Loading'
import { EmptyState } from '../components/EmptyState'

type ViewMode = 'grid' | 'list'

const statusLabels: Record<BookStatus | 'ALL', string> = {
  ALL: '全部',
  WANT_TO_READ: '想读',
  READING: '在读',
  FINISHED: '已读',
}

export const Books = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<BookStatus | 'ALL'>((searchParams.get('status') as BookStatus) || 'ALL')
  const [tagId, setTagId] = useState(searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, tagsRes] = await Promise.all([
          bookApi.getAll({ status, tagId, search }),
          tagApi.getAll(),
        ])
        setBooks(booksRes.data)
        setTags(tagsRes.data)
      } catch (error) {
        console.error('Failed to fetch books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, tagId, search])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (status !== 'ALL') params.status = status
    if (tagId) params.tagId = tagId.toString()
    if (search) params.search = search
    setSearchParams(params)
  }, [status, tagId, search, setSearchParams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const getBookStatusClass = (status: BookStatus) => {
    switch (status) {
      case 'WANT_TO_READ': return 'bg-blue-50 text-blue-600'
      case 'READING': return 'bg-green-50 text-green-600'
      case 'FINISHED': return 'bg-yellow-50 text-yellow-600'
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brown-700">书架</h1>
        <button
          onClick={() => {
            const modal = document.getElementById('add-book-modal')
            if (modal) modal.classList.remove('hidden')
          }}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors text-sm font-medium"
        >
          添加书籍
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="搜索书名或作者..."
              className="w-full px-4 py-2 pl-10 border border-brown-200 rounded-lg bg-cream-50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatus(key as BookStatus | 'ALL')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  status === key
                    ? 'bg-brown-500 text-white'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-brown-400">分类：</span>
            <button
              onClick={() => setTagId(undefined)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                !tagId ? 'bg-brown-500 text-white' : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
              }`}
            >
              全部
            </button>
            {tags.filter(t => t.type === 'BOOK').map((tag) => (
              <button
                key={tag.id}
                onClick={() => setTagId(tag.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  tagId === tag.id ? 'bg-brown-500 text-white' : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {tag.name} ({tag.bookCount})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-brown-400">共 {books.length} 本书</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brown-100 text-brown-600' : 'text-brown-400 hover:bg-brown-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brown-100 text-brown-600' : 'text-brown-400 hover:bg-brown-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyState
          title="书架是空的"
          description="添加你的第一本书吧"
          action={{ label: '添加书籍', onClick: () => document.getElementById('add-book-modal')?.classList.remove('hidden') }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="group">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-3 shadow-sm">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-brown-300 p-4">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs text-center line-clamp-2">{book.title}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getBookStatusClass(book.status)}`}>
                    {statusLabels[book.status]}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-brown-700 truncate group-hover:text-brown-500 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-brown-400 truncate">{book.author}</p>
              {book.rating > 0 && (
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3 h-3 ${i < book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-brown-200'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream-50 border-b border-brown-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">封面</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">书名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">作者</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">评分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown-500">笔记数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/books/${book.id}`}>
                      {book.cover ? (
                        <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-16 bg-cream-100 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/books/${book.id}`} className="text-sm font-medium text-brown-700 hover:text-brown-500">
                      {book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-brown-500">{book.author}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getBookStatusClass(book.status)}`}>
                      {statusLabels[book.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-brown-200'}`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-brown-500">{book.notes?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddBookModal onClose={() => {
        document.getElementById('add-book-modal')?.classList.add('hidden')
        setLoading(true)
      }} />
    </div>
  )
}

const AddBookModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    publisher: '',
    publishDate: '',
    isbn: '',
    totalPages: '',
    status: 'WANT_TO_READ' as BookStatus,
    rating: '0',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await bookApi.create({
        title: formData.title,
        author: formData.author,
        cover: formData.cover || undefined,
        publisher: formData.publisher || undefined,
        publishDate: formData.publishDate || undefined,
        isbn: formData.isbn || undefined,
        totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
        status: formData.status,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || '添加书籍失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="add-book-modal" className="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">添加书籍</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">书名 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">作者 *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">封面 URL</label>
              <input
                type="url"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">出版社</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">出版日期</label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">总页数</label>
              <input
                type="number"
                value={formData.totalPages}
                onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              >
                <option value="WANT_TO_READ">想读</option>
                <option value="READING">在读</option>
                <option value="FINISHED">已读</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">评分</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              >
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} 星</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">分类标签</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              placeholder="多个标签用逗号分隔"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors disabled:opacity-50"
            >
              {loading ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}