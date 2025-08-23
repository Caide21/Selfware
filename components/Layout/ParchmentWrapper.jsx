export default function ModernScrollWrapper({ children }) {
  return (
    <div className="relative min-h-screen rounded-2xl overflow-hidden shadow-xl">
      {/* Fluid organic gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f1f1f] to-[#111] opacity-90" />

      {/* Optional noise texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />

      <div className="relative z-10 px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  )
}
