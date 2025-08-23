export default function PageHeading({ emoji, title, subtitle }) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex justify-center items-center gap-2">
        {emoji && <span className="text-4xl">{emoji}</span>}
        {title}
      </h1>
      {subtitle && (
        <p className="text-theme-muted max-w-2xl mx-auto text-base sm:text-lg">
          {subtitle}
        </p>
      )}
    </section>
  );
}
