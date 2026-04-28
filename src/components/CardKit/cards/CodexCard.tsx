export interface CodexCardProps {
  title?: string;
  updated: string | number | Date;
  content?: string;
}

export default function CodexCard({ title, updated, content }: CodexCardProps) {
  return (
    <div className="theme-scroll-card w-full rounded-xl px-4 py-4 sm:px-6 sm:py-6 space-y-3 bg-black text-white">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      <p className="theme-muted text-xs">{new Date(updated).toLocaleString()}</p>
      <pre className="theme-muted whitespace-pre-wrap text-sm">{content}</pre>
    </div>
  );
}
