import PageShell from "@/components/Layout/PageShell";

export default function Contact() {
  return (
    <PageShell
      heading={{
        emoji: "📬",
        title: "Contact",
        subtitle: "Questions, projects, or collaborations — feel free to reach out.",
      }}
    >
      <div className="text-white/80 space-y-4 max-w-md mx-auto px-4 text-center text-sm sm:text-base">
        <p>Email: <a href="mailto:your@email.com" className="underline">your@email.com</a></p>
        <p>Instagram: <a href="https://instagram.com/selfware.space" className="underline">@selfware.space</a></p>
        <p>Telegram: <span className="text-white">caide_systems</span></p>
      </div>
    </PageShell>
  );
}
