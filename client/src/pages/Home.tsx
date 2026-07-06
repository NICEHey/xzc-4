import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookApi, noteApi, statsApi } from '../api/client'
import { Book, Note, Stats } from '../types'
import { Loading } from '../components/Loading'
import { EmptyState } from '../components/EmptyState'

export const Home = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [readingBooks, setReadingBooks] = useState<Book[]>([])
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, booksRes, notesRes] = await Promise.all([
          statsApi.get(),
          bookApi.getAll({ status: 'READING', sortBy: 'updatedAt', sortOrder: 'desc' }),
          noteApi.getAll({}),
        ])

        setStats(statsRes.data)
        setReadingBooks(booksRes.data)
        setRecentNotes(notesRes.data.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats?.thisYearFinished || 0}</div>
          <div className="text-sm text-brown-400">今年已读完</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats?.readingNow || 0}</div>
          <div className="text-sm text-brown-400">在读中</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats?.totalNotes || 0}</div>
          <div className="text-sm text-brown-400">累计笔记</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats?.consecutiveDays || 0}</div>
          <div className="text-sm text-brown-400">连续阅读天数</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">在读中</h2>
          <Link to="/books?status=READING" className="text-sm text-brown-500 hover:text-brown-600">
            查看全部
          </Link>
        </div>
        {readingBooks.length === 0 ? (
          <EmptyState
            title="暂无在读书籍"
            description="开始阅读你的第一本书吧"
            action={{ label: '添加书籍', onClick: () => window.location.href = '/books' }}
          />
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {readingBooks.map((book) => (
                <Link key={book.id} to={`/books/${book.id}`} className="group">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-3">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brown-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-brown-700 truncate group-hover:text-brown-500 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-brown-400 truncate">{book.author}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">最近笔记</h2>
          <Link to="/notes" className="text-sm text-brown-500 hover:text-brown-600">
            查看全部
          </Link>
        </div>
        {recentNotes.length === 0 ? (
          <EmptyState
            title="暂无笔记"
            description="记录你的第一个读书笔记吧"
            action={{ label: '写笔记', onClick: () => window.location.href = '/books' }}
          />
        ) : (
          <div className="divide-y divide-brown-100">
            {recentNotes.map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`} className="p-5 hover:bg-cream-50 transition-colors block">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-brown-700 line-clamp-2 mb-2">{note.content}</p>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-brown-400">
                        {note.book?.title || '未知书籍'}
                      </span>
                      {note.pageNumber && (
                        <span className="text-xs text-brown-300">P{note.pageNumber}</span>
                      )}
                      <span className="text-xs text-brown-300">
                        {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      note.type === 'QUOTE' ? 'bg-blue-50 text-blue-600' :
                      note.type === 'THOUGHT' ? 'bg-green-50 text-green-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {note.type === 'QUOTE' ? '摘抄' : note.type === 'THOUGHT' ? '感想' : '划线'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}