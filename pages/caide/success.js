import PageShell from "@/components/Layout/PageShell";
import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <PageShell
      heading={{
        emoji: "🪞",
        title: "Payment Successful",
        subtitle: "YYour payment went through — I’ll be in touch shortly.",
      }}
    >
      <div className="text-white/80 space-y-6 text-center max-w-xl mx-auto text-sm sm:text-base px-4">
        <p className="text-white/60">
          I’ll contact you shortly to begin your session.  
          If you haven’t heard from me within 24 hours, reach out via the contact scroll.
        </p>
        <Link
          href="/caide"
          className="inline-block px-6 py-3 mt-2 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
        >
          Return to Caide
        </Link>
      </div>
    </PageShell>
  );
}
