export default function PageHeading({ emoji, title, subtitle }) {
  if (!emoji && !title && !subtitle) return null;

  return (
    <section className="text-center space-y-3">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight flex justify-center items-center gap-2 text-text pp-text">
        {emoji && <span className="text-4xl">{emoji}</span>}
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-text-muted pp-muted">
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
