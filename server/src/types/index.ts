export type BookStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED'
export type NoteType = 'QUOTE' | 'THOUGHT' | 'HIGHLIGHT'
export type TagType = 'BOOK' | 'NOTE'

export interface UserPayload {
  id: number
  username: string
  email: string
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

export interface UpdateProfileInput {
  username?: string
  avatar?: string
  bio?: string
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

export interface UpdateBookInput {
  title?: string
  author?: string
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

export interface UpdateNoteInput {
  type?: NoteType
  content?: string
  pageNumber?: number
  tags?: string[]
  isFavorite?: boolean
}

export interface CreateReadingProgressInput {
  bookId: number
  page?: number
  percentage?: number
  durationMinutes?: number
}

export interface BookFilter {
  status?: BookStatus | 'ALL'
  tagId?: number
  search?: string
  sortBy?: 'createdAt' | 'rating' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface NoteFilter {
  bookId?: number
  tagId?: number
  search?: string
  type?: NoteType
  isFavorite?: string
}

export interface StatsResponse {
  thisYearFinished: number
  readingNow: number
  totalNotes: number
  consecutiveDays: number
  monthlyReading: MonthlyReading[]
  categoryDistribution: CategoryDistribution[]
  ratingDistribution: RatingDistribution[]
  totalReadingMinutes: number
}

export interface MonthlyReading {
  month: string
  count: number
}

export interface CategoryDistribution {
  tag: string
  count: number
}

export interface RatingDistribution {
  rating: number
  count: number
}