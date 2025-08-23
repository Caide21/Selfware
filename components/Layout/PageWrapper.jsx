export default function PageWrapper({ children }) {
  return (
    <main className="bg-black text-white min-h-screen pt-32 pb-20 px-4 sm:px-6">
      {children}
    </main>
  );
}
