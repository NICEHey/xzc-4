import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookListApi } from '../api/client'
import { BookList } from '../types'
import { Loading } from '../components/Loading'
import { EmptyState } from '../components/EmptyState'

export const BookLists = () => {
  const [bookLists, setBookLists] = useState<BookList[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookListApi.getAll()
        setBookLists(res.data)
      } catch (error) {
        console.error('Failed to fetch book lists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个书单吗？书单中的书籍不会被删除。')) {
      try {
        await bookListApi.delete(id)
        setBookLists(prev => prev.filter(list => list.id !== id))
      } catch (error) {
        console.error('Failed to delete book list:', error)
      }
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brown-700">我的书单</h1>
          <p className="text-brown-500 mt-1">整理你的阅读计划，分类管理书籍</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors"
        >
          创建书单
        </button>
      </div>

      {bookLists.length === 0 ? (
        <EmptyState
          title="还没有书单"
          description="创建一个书单来整理你的书籍"
          actionText="创建书单"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-cream-100 relative">
                {list.cover ? (
                  <img src={list.cover} alt={list.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-brown-300">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm">{list.name}</span>
                  </div>
                )}
                {list.isPublic && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    公开
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-brown-700 truncate">{list.name}</h3>
                </div>

                {list.description && (
                  <p className="text-sm text-brown-500 line-clamp-2 mb-3">{list.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-brown-400">
                    {list.bookCount || 0} 本书
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/book-lists/${list.id}`}
                      className="text-sm text-brown-500 hover:text-brown-600"
                    >
                      查看
                    </Link>
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="text-sm text-red-400 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBookListModal onClose={() => setShowCreateModal(false)} onCreated={() => window.location.reload()} />
      )}
    </div>
  )
}

const CreateBookListModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    cover: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await bookListApi.create(formData)
      onCreated()
      onClose()
    } catch (error) {
      console.error('Failed to create book list:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">创建书单</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">书单名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              required
              placeholder="例如：2024年必读书目"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">书单描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              rows={3}
              placeholder="简短描述这个书单的主题..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">封面 URL</label>
            <input
              type="url"
              value={formData.cover}
              onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              placeholder="可选"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 text-brown-500 border-brown-200 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-brown-600">设为公开书单</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50">取消</button>
            <button type="submit" className="flex-1 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600">创建</button>
          </div>
        </form>
      </div>
    </div>
  )
}