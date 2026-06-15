"use client"

interface PageLoaderProps {
  isLoading: boolean
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-xs tracking-widest uppercase animate-pulse">Loading…</p>
      </div>
    </div>
  )
}
