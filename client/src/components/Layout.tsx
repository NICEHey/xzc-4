import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) {
    return <div className="min-h-screen bg-cream-50">{children}</div>
  }

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/books', label: '书架' },
    { path: '/book-lists', label: '书单' },
    { path: '/notes', label: '笔记' },
    { path: '/stats', label: '统计' },
    { path: '/profile', label: '我的' },
  ]

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-brown-700 hover:text-brown-500 transition-colors">
              书摘
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-brown-600'
                      : 'text-brown-400 hover:text-brown-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="text-sm text-brown-400 hover:text-brown-600 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden bg-white border-t">
          <nav className="flex justify-around py-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-brown-600'
                    : 'text-brown-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}