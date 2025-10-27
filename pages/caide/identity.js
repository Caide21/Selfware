import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY�z',
  title: 'Identity',
  subtitle: 'How I think, what I notice, and the perspective I bring.',
};

export default function Identity() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 text-center text-sm text-text-muted sm:text-base">
      <p>
        I don’t really do personas—I just notice things. Patterns, emotions, the signals under the surface. I’ve always
        been tuned to feedback and the quiet shifts people often miss.
      </p>
      <p>
        I tend to notice the invisible stuff—the little signals under the surface that shape how people work and connect.
        My focus is on translating that into systems that feel natural and make life run smoother.
      </p>
    </div>
  );
}
