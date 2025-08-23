export default function ScrollPage({ title, symbol, essence, coreLaw, ritual }) {
  return (
    <div
      className="relative p-4 sm:p-6 rounded-2xl shadow-lg theme-scroll-card mb-6 overflow-hidden w-full"
      style={{
        backgroundImage: `url('/parchment-texture.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="absolute top-4 right-4 text-3xl sm:text-4xl opacity-30">{symbol}</div>
      <h1 className="text-2xl sm:text-4xl font-bold mb-2">{title}</h1>
      <p className="italic mb-4">{essence}</p>
      <h2 className="text-base sm:text-lg font-semibold mb-1">Core Law</h2>
      <p className="mb-4">{coreLaw}</p>
      <h2 className="text-base sm:text-lg font-semibold mb-1">Ritual</h2>
      <p>{ritual}</p>
    </div>
  )
}
