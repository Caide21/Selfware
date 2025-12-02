export default function NavBar({ children }) {
  return (
    <div
      className="
      sticky top-4 z-40 mx-auto max-w-6xl px-4 py-2 rounded-3xl
      bg-white/55 dark:bg-white/8 backdrop-blur
      ring-1 ring-black/5 dark:ring-white/10 relative isolate
      before:absolute before:inset-0 before:rounded-inherit before:pointer-events-none
      before:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-12px_30px_-18px_rgba(0,0,0,0.28)]
      after:absolute after:inset-0 after:rounded-inherit after:pointer-events-none
      after:[background:linear-gradient(to_bottom,rgba(255,255,255,.18),transparent_35%)]
    "
    >
      {children}
    </div>
  );
}
