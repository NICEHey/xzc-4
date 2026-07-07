import axios from 'axios'
import { AuthResponse, RegisterInput, LoginInput, User, Book, Note, Tag, Stats, CreateBookInput, CreateNoteInput, ReadingProgress, BookList, PaginatedNotes } from '../types'

const API_BASE_URL = 'http://localhost:4000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: RegisterInput) => client.post<AuthResponse>('/auth/register', data),
  login: (data: LoginInput) => client.post<AuthResponse>('/auth/login', data),
}

export const userApi = {
  getMe: () => client.get<User>('/users/me'),
  updateProfile: (data: Partial<User>) => client.put<User>('/users/me', data),
}

export const bookApi = {
  getAll: (params?: { status?: string; tagId?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    client.get<Book[]>('/books', { params }),
  getById: (id: number) => client.get<Book>(`/books/${id}`),
  create: (data: CreateBookInput) => client.post<Book>('/books', data),
  update: (id: number, data: Partial<CreateBookInput>) => client.put<Book>(`/books/${id}`, data),
  delete: (id: number) => client.delete(`/books/${id}`),
}

export const noteApi = {
  getAll: (params?: { bookId?: number; tagId?: number; search?: string; type?: string; isFavorite?: boolean; page?: number; pageSize?: number }) =>
    client.get<PaginatedNotes>('/notes', { params }),
  getById: (id: number) => client.get<Note>(`/notes/${id}`),
  create: (data: CreateNoteInput) => client.post<Note>('/notes', data),
  update: (id: number, data: Partial<CreateNoteInput>) => client.put<Note>(`/notes/${id}`, data),
  delete: (id: number) => client.delete(`/notes/${id}`),
  export: (id: number) => client.get(`/notes/${id}/export`, { responseType: 'blob' }),
}

export const progressApi = {
  create: (data: { bookId: number; page?: number; percentage?: number; durationMinutes?: number }) =>
    client.post<ReadingProgress>('/progress', data),
  getByBookId: (bookId: number) => client.get<ReadingProgress[]>(`/progress/book/${bookId}`),
}

export const tagApi = {
  getAll: () => client.get<Tag[]>('/tags'),
  getBooksByTag: (tagId: number) => client.get<Book[]>(`/tags/${tagId}/books`),
  getNotesByTag: (tagId: number) => client.get<Note[]>(`/tags/${tagId}/notes`),
}

export const statsApi = {
  get: () => client.get<Stats>('/stats'),
}

export const bookListApi = {
  getAll: () => client.get<BookList[]>('/book-lists'),
  getById: (id: number) => client.get<BookList>(`/book-lists/${id}`),
  getPublic: () => client.get<BookList[]>('/book-lists/public'),
  create: (data: { name: string; description?: string; isPublic?: boolean; cover?: string }) =>
    client.post<BookList>('/book-lists', data),
  update: (id: number, data: Partial<{ name: string; description?: string; isPublic?: boolean; cover?: string }>) =>
    client.put<BookList>(`/book-lists/${id}`, data),
  delete: (id: number) => client.delete(`/book-lists/${id}`),
  addBook: (id: number, bookId: number) =>
    client.post(`/book-lists/${id}/books`, { bookId }),
  removeBook: (id: number, bookId: number) =>
    client.delete(`/book-lists/${id}/books/${bookId}`),
}

export default client