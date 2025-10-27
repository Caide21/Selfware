import { usePageHeading } from '@/components/Layout/PageShell';
import Link from 'next/link';

const PAGE_HEADING = {
  emoji: 'dY�z',
  title: 'Payment Successful',
  subtitle: 'Your payment went through—I’ll be in touch shortly.',
};

export default function PaymentSuccess() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 text-center text-sm text-text-muted sm:text-base">
      <p>
        I’ll contact you shortly to begin your session. If you haven’t heard from me within 24 hours, reach out via the
        contact scroll.
      </p>
      <Link
        href="/caide"
        className="inline-block rounded-full bg-cta-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-lg hover:brightness-110"
      >
        Return to Caide
      </Link>
    </div>
  );
}
