import { ReactNode } from 'react'

interface LoadingProps {
  text?: string
  children?: ReactNode
}

export const Loading = ({ text = '加载中...', children }: LoadingProps) => {
  if (children) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-brown-500 text-sm">{text}</p>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-brown-300 border-t-brown-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-brown-500">{text}</p>
    </div>
  )
}