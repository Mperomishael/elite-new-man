"use client"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 number */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse">
              4
            </div>
            <div className="relative">
              <div
                className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 animate-bounce"
                style={{ animationDelay: "0.1s" }}
              >
                0
              </div>
              <div
                className="absolute inset-0 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"
                style={{ opacity: 0.5 }}
              >
                0
              </div>
            </div>
            <div
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            >
              4
            </div>
          </div>
        </div>

        {/* Animated message */}
        <div className="space-y-3 animate-in fade-in duration-1000">
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <div className="space-y-2 text-slate-300 text-sm leading-relaxed">
            <p className="inline-block animate-pulse">It is our fault, not yours.</p>
            <p className="inline-block ml-1">We apologize for this inconvenience.</p>
            <p className="text-emerald-400 font-semibold pt-2 inline-block">We'll be back shortly.</p>
          </div>
        </div>

        {/* Animated loader */}
        <div className="flex justify-center items-end gap-1 h-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-t from-cyan-400 to-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}
