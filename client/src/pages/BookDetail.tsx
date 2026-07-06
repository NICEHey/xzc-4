import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookApi, noteApi, progressApi } from '../api/client'
import { Book, Note, BookStatus, ReadingProgress } from '../types'
import { Loading } from '../components/Loading'

const statusLabels: Record<BookStatus, string> = {
  WANT_TO_READ: '想读',
  READING: '在读',
  FINISHED: '已读',
}

const getBookStatusClass = (status: BookStatus) => {
  switch (status) {
    case 'WANT_TO_READ': return 'bg-blue-50 text-blue-600'
    case 'READING': return 'bg-green-50 text-green-600'
    case 'FINISHED': return 'bg-yellow-50 text-yellow-600'
  }
}

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, notesRes, progressRes] = await Promise.all([
          bookApi.getById(Number(id)),
          noteApi.getAll({ bookId: Number(id) }),
          progressApi.getByBookId(Number(id)),
        ])
        setBook(bookRes.data)
        setNotes(notesRes.data)
        setProgress(progressRes.data)
      } catch (error) {
        console.error('Failed to fetch book detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (confirm('确定要删除这本书吗？')) {
      try {
        await bookApi.delete(Number(id))
        navigate('/books')
      } catch (error) {
        console.error('Failed to delete book:', error)
      }
    }
  }

  const handleStatusChange = async (newStatus: BookStatus) => {
    try {
      await bookApi.update(Number(id), { status: newStatus })
      setBook(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const currentProgress = progress[0]
  const progressPercent = currentProgress?.percentage || 
    (currentProgress?.page && book?.totalPages ? Math.round((currentProgress.page / book.totalPages) * 100) : 0)

  if (loading) {
    return <Loading />
  }

  if (!book) {
    return <div className="text-center py-12">书籍不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/books')} className="text-brown-500 hover:text-brown-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书架
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEditModal(true)} className="px-3 py-1.5 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50 text-sm">
            编辑
          </button>
          <button onClick={handleDelete} className="px-3 py-1.5 text-red-500 hover:text-red-600 text-sm">
            删除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-5 gap-6 p-6">
          <div className="md:col-span-2">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-cream-100">
              {book.cover ? (
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-brown-300 p-8">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-center">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-brown-700 mb-2">{book.title}</h1>
              <p className="text-brown-500">{book.author}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${getBookStatusClass(book.status)}`}>
                {statusLabels[book.status]}
              </span>
              {book.rating > 0 && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-brown-200'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="text-sm text-brown-500 ml-1">{book.rating}</span>
                </div>
              )}
            </div>

            {book.status !== 'WANT_TO_READ' && (
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-brown-600">阅读进度</span>
                  <span className="text-sm font-medium text-brown-700">
                    {currentProgress?.page || 0} / {book.totalPages || '-'} 页 ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-2">
                  <div className="bg-brown-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <button onClick={() => setShowProgressModal(true)} className="mt-3 text-sm text-brown-500 hover:text-brown-600">
                  更新进度
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {book.tags?.map((bt) => (
                <span key={bt.tag.id} className="px-2 py-1 bg-cream-100 text-brown-600 rounded text-sm">
                  {bt.tag.name}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brown-100">
              <div>
                <span className="text-xs text-brown-400">出版社</span>
                <p className="text-sm text-brown-600">{book.publisher || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">出版日期</span>
                <p className="text-sm text-brown-600">{book.publishDate ? new Date(book.publishDate).toLocaleDateString('zh-CN') : '-'}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">ISBN</span>
                <p className="text-sm text-brown-600">{book.isbn || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">总页数</span>
                <p className="text-sm text-brown-600">{book.totalPages || '-'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key as BookStatus)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    book.status === key
                      ? 'bg-brown-500 text-white'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-brown-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brown-700">笔记 ({notes.length})</h2>
            <Link to={`/books/${id}/notes`} className="text-sm text-brown-500 hover:text-brown-600">
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-brown-100">
            {notes.slice(0, 3).map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`} className="p-5 hover:bg-cream-50 transition-colors block">
                <p className="text-sm text-brown-700 line-clamp-2">{note.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  {note.pageNumber && <span className="text-xs text-brown-400">P{note.pageNumber}</span>}
                  <span className="text-xs text-brown-400">{new Date(note.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </Link>
            ))}
            {notes.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-brown-400">暂无笔记</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-brown-100">
            <h2 className="text-lg font-semibold text-brown-700">阅读记录</h2>
          </div>
          <div className="divide-y divide-brown-100 max-h-64 overflow-y-auto">
            {progress.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brown-600">
                    {p.page ? `第 ${p.page} 页` : ''}
                    {p.percentage && ` ${Math.round(p.percentage)}%`}
                  </span>
                  <span className="text-xs text-brown-400">
                    {new Date(p.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                {p.durationMinutes && (
                  <p className="text-xs text-brown-400 mt-1">阅读时长: {p.durationMinutes} 分钟</p>
                )}
              </div>
            ))}
            {progress.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-brown-400">暂无阅读记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && <EditBookModal book={book} onClose={() => setShowEditModal(false)} />}
      {showProgressModal && <ProgressModal book={book} onClose={() => setShowProgressModal(false)} />}
    </div>
  )
}

const EditBookModal = ({ book, onClose }: { book: Book; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    cover: book.cover || '',
    publisher: book.publisher || '',
    publishDate: book.publishDate || '',
    isbn: book.isbn || '',
    totalPages: book.totalPages?.toString() || '',
    status: book.status,
    rating: book.rating.toString(),
    tags: book.tags?.map(t => t.tag.name).join(', ') || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await bookApi.update(book.id, {
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
      window.location.reload()
    } catch (error) {
      console.error('Failed to update book:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">编辑书籍</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">书名 *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">作者 *</label>
              <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">封面 URL</label>
              <input type="url" value={formData.cover} onChange={(e) => setFormData({ ...formData, cover: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">出版社</label>
              <input type="text" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">出版日期</label>
              <input type="date" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">ISBN</label>
              <input type="text" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">总页数</label>
              <input type="number" value={formData.totalPages} onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">状态</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50">
                <option value="WANT_TO_READ">想读</option>
                <option value="READING">在读</option>
                <option value="FINISHED">已读</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-1">评分</label>
              <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50">
                {[0, 1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} 星</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">分类标签</label>
            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" placeholder="多个标签用逗号分隔" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50">取消</button>
            <button type="submit" className="flex-1 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ProgressModal = ({ book, onClose }: { book: Book; onClose: () => void }) => {
  const [page, setPage] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const percentage = book.totalPages && page ? (Number(page) / book.totalPages) * 100 : undefined
      await progressApi.create({
        bookId: book.id,
        page: page ? Number(page) : undefined,
        percentage,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      })
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Failed to add progress:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">记录阅读进度</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">当前页码</label>
            <input type="number" value={page} onChange={(e) => setPage(e.target.value)} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" placeholder={`1 - ${book.totalPages}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">阅读时长（分钟）</label>
            <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50" placeholder="可选" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50">取消</button>
            <button type="submit" className="flex-1 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600">记录</button>
          </div>
        </form>
      </div>
    </div>
  )
}