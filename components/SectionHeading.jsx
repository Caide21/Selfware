export default function SectionHeading({ emoji, children }) {
  return (
    <div className="text-center mb-10">
      {emoji && <div className="text-4xl mb-2">{emoji}</div>}
      <h1 className="text-4xl font-bold tracking-tight">{children}</h1>
    </div>
  );
}

