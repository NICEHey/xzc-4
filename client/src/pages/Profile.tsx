import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/client'


export const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await userApi.updateProfile(formData)
      updateUser(res.data)
      setShowEdit(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brown-700">个人中心</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-cream-200 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-brown-700 mb-1">{user?.username}</h2>
              <p className="text-brown-400 mb-3">{user?.email}</p>
              {user?.bio && (
                <p className="text-brown-600 mb-3">{user.bio}</p>
              )}
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 transition-colors text-sm"
              >
                编辑资料
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-brown-100">
            <h3 className="text-sm font-medium text-brown-500 mb-4">账户信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-brown-400">用户名</span>
                <p className="text-sm text-brown-600">{user?.username}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">邮箱</span>
                <p className="text-sm text-brown-600">{user?.email}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">注册时间</span>
                <p className="text-sm text-brown-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}</p>
              </div>
              <div>
                <span className="text-xs text-brown-400">头像 URL</span>
                <p className="text-sm text-brown-600 truncate">{user?.avatar || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

const EditProfileModal = ({
  formData,
  setFormData,
  loading,
  onSubmit,
  onClose,
}: {
  formData: { username: string; avatar: string; bio: string }
  setFormData: React.Dispatch<React.SetStateAction<{ username: string; avatar: string; bio: string }>>
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-brown-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brown-700">编辑资料</h2>
          <button onClick={onClose} className="text-brown-400 hover:text-brown-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">用户名 *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">头像 URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-1">个人简介</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-cream-50 h-24 resize-none"
              placeholder="简单介绍一下自己..."
            />
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