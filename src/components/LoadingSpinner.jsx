export default function LoadingSpinner({ size = 'md', text = 'Đang tải...' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`} />
      {text && <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-48 rounded-xl mb-4" />
      <div className="skeleton h-4 rounded w-3/4 mb-2" />
      <div className="skeleton h-4 rounded w-1/2 mb-4" />
      <div className="skeleton h-8 rounded-xl" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Đang xử lý...</p>
      </div>
    </div>
  )
}
