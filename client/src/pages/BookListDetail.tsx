import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookListApi, bookApi } from '../api/client'
import { BookList, Book, BookStatus } from '../types'
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

export const BookListDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bookList, setBookList] = useState<BookList | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listRes, booksRes] = await Promise.all([
          bookListApi.getById(Number(id)),
          bookApi.getAll(),
        ])
        setBookList(listRes.data)
        setBooks(listRes.data.books || [])
        setAllBooks(booksRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAddBook = async (bookId: number) => {
    try {
      await bookListApi.addBook(Number(id), bookId)
      setShowAddModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Failed to add book:', error)
    }
  }

  const handleRemoveBook = async (bookId: number) => {
    if (confirm('确定要从书单中移除这本书吗？')) {
      try {
        await bookListApi.removeBook(Number(id), bookId)
        setBooks(prev => prev.filter(b => b.id !== bookId))
      } catch (error) {
        console.error('Failed to remove book:', error)
      }
    }
  }

  const handleTogglePublic = async () => {
    if (!bookList) return
    try {
      await bookListApi.update(Number(id), { isPublic: !bookList.isPublic })
      setBookList(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null)
    } catch (error) {
      console.error('Failed to update visibility:', error)
    }
  }

  const availableBooks = allBooks.filter(b => !books.some(book => book.id === b.id))
  const filteredBooks = availableBooks.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  if (!bookList) {
    return <div className="text-center py-12">书单不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/book-lists')} className="text-brown-500 hover:text-brown-600 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书单列表
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors"
        >
          添加书籍
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-5 gap-6 p-6">
          <div className="md:col-span-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-cream-100">
              {bookList.cover ? (
                <img src={bookList.cover} alt={bookList.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-brown-300">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{bookList.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-brown-700">{bookList.name}</h1>
                <button
                  onClick={handleTogglePublic}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    bookList.isPublic
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {bookList.isPublic ? '公开' : '私有'}
                </button>
              </div>
              {bookList.description && (
                <p className="text-brown-500 mt-2">{bookList.description}</p>
              )}
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-brown-100">
              <div>
                <span className="text-2xl font-bold text-brown-700">{books.length}</span>
                <p className="text-sm text-brown-400">本书</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-brown-700">
                  {books.filter(b => b.status === 'FINISHED').length}
                </span>
                <p className="text-sm text-brown-400">已读</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-brown-700">
                  {books.filter(b => b.status === 'READING').length}
                </span>
                <p className="text-sm text-brown-400">在读</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brown-100">
          <h2 className="text-lg font-semibold text-brown-700">书籍列表</h2>
        </div>

        {books.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-brown-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-brown-400">书单中还没有书籍</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors"
            >
              添加书籍
            </button>
          </div>
        ) : (
          <div className="divide-y divide-brown-100">
            {books.map((book) => (
              <div key={book.id} className="p-5 flex items-center gap-4 hover:bg-cream-50 transition-colors">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brown-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown-700 truncate">{book.title}</h3>
                  <p className="text-sm text-brown-500 truncate">{book.author}</p>
                </div>

                <span className={`px-2 py-1 rounded-full text-xs ${getBookStatusClass(book.status)}`}>
                  {statusLabels[book.status]}
                </span>

                <button
                  onClick={() => handleRemoveBook(book.id)}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBookModal
          books={filteredBooks}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAdd={handleAddBook}
          onClose={() => { setShowAddModal(false); setSearchTerm('') }}
        />
      )}
    </div>
  )
}

const AddBookModal = ({
  books,
  searchTerm,
  onSearchChange,
  onAdd,
  onClose,
}: {
  books: Book[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAdd: (bookId: number) => void
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">添加书籍到书单</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-brown-100">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
            placeholder="搜索书籍..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {books.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brown-400">
                {searchTerm ? '没有找到匹配的书籍' : '没有可添加的书籍了'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => onAdd(book.id)}
                  className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-cream-50 transition-colors text-left"
                >
                  <div className="w-10 h-12 rounded overflow-hidden bg-cream-100 flex-shrink-0">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brown-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown-700 truncate">{book.title}</p>
                    <p className="text-sm text-brown-500 truncate">{book.author}</p>
                  </div>
                  <svg className="w-5 h-5 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brown-100">
          <button onClick={onClose} className="w-full py-2 border border-brown-200 text-brown-600 rounded-lg hover:bg-cream-50">取消</button>
        </div>
      </div>
    </div>
  )
}