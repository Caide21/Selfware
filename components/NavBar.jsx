export default function NavBar({ children }) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">{children}</div>
    </div>
  );
}
