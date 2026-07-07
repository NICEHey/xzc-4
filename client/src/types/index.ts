export type BookStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED'
export type NoteType = 'QUOTE' | 'THOUGHT' | 'HIGHLIGHT'
export type TagType = 'BOOK' | 'NOTE'

export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt: string
}

export interface Book {
  id: number
  userId: number
  title: string
  author: string
  cover?: string
  publisher?: string
  publishDate?: string
  isbn?: string
  totalPages?: number
  status: BookStatus
  rating: number
  createdAt: string
  updatedAt: string
  tags?: { tag: Tag }[]
  notes?: { id: number }[]
  progress?: ReadingProgress[]
  bookListBooks?: { bookList: { id: number; name: string } }[]
}

export interface Note {
  id: number
  bookId: number
  userId: number
  type: NoteType
  content: string
  pageNumber?: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  book?: { id: number; title: string; author?: string; cover?: string }
  tags?: { tag: Tag }[]
}

export interface Tag {
  id: number
  name: string
  type: TagType
  bookCount?: number
  noteCount?: number
}

export interface ReadingProgress {
  id: number
  bookId: number
  userId: number
  page?: number
  percentage?: number
  durationMinutes?: number
  createdAt: string
  updatedAt: string
}

export interface BookList {
  id: number
  userId: number
  name: string
  description?: string
  isPublic: boolean
  cover?: string
  createdAt: string
  updatedAt: string
  bookCount?: number
  books?: Book[]
  user?: { id: number; username: string }
}

export interface BookListBook {
  id: number
  bookListId: number
  bookId: number
  orderIndex: number
  createdAt: string
  bookList?: { id: number; name: string }
  book?: Book
}

export interface PaginatedNotes {
  data: Note[]
  total: number
  page: number
  pageSize: number
}

export interface Stats {
  thisYearFinished: number
  readingNow: number
  totalNotes: number
  consecutiveDays: number
  monthlyReading: { month: string; count: number }[]
  categoryDistribution: { tag: string; count: number }[]
  ratingDistribution: { rating: number; count: number }[]
  totalReadingMinutes: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateBookInput {
  title: string
  author: string
  cover?: string
  publisher?: string
  publishDate?: string
  isbn?: string
  totalPages?: number
  status?: BookStatus
  rating?: number
  tags?: string[]
}

export interface CreateNoteInput {
  bookId: number
  type?: NoteType
  content: string
  pageNumber?: number
  tags?: string[]
  isFavorite?: boolean
}