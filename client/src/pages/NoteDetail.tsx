import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { noteApi } from '../api/client'
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

export const NoteDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await noteApi.getById(Number(id))
        setNote(res.data)
      } catch (error) {
        console.error('Failed to fetch note:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  }, [id])

  const handleDelete = async () => {
    if (confirm('确定要删除这条笔记吗？')) {
      try {
        await noteApi.delete(Number(id))
        navigate('/notes')
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
    }
  }

  const handleExport = async () => {
    try {
      const res = await noteApi.export(Number(id))
      const blob = new Blob([res.data], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `note-${id}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export note:', error)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!note) {
    return <div className="text-center py-12">笔记不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/notes')} className="text-brown-500 hover:text-brown-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回笔记列表
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="px-3 py-1.5 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50 text-sm">
            导出
          </button>
          <button onClick={() => setShowEditModal(true)} className="px-3 py-1.5 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50 text-sm">
            编辑
          </button>
          <button onClick={handleDelete} className="px-3 py-1.5 text-red-500 hover:text-red-600 text-sm">
            删除
          </button>
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
              <Link to={`/books/${note.bookId}`} className="text-lg font-medium text-brown-700 hover:text-brown-500">
                {note.book?.title}
              </Link>
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
            {note.createdAt !== note.updatedAt && (
              <span>最后修改于 {new Date(note.updatedAt).toLocaleString('zh-CN')}</span>
            )}
          </div>
        </div>
      </div>

      {showEditModal && <EditNoteModal note={note} onClose={() => setShowEditModal(false)} />}
    </div>
  )
}

const EditNoteModal = ({ note, onClose }: { note: Note; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    type: note.type,
    content: note.content,
    pageNumber: note.pageNumber?.toString() || '',
    tags: note.tags?.map(t => t.tag.name).join(', ') || '',
    isFavorite: note.isFavorite,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await noteApi.update(note.id, {
        type: formData.type,
        content: formData.content,
        pageNumber: formData.pageNumber ? Number(formData.pageNumber) : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isFavorite: formData.isFavorite,
      })
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Failed to update note:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">编辑笔记</h2>
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