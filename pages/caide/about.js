import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY"o',
  title: 'Story',
  subtitle: 'Where I started, what shaped me, and why I build Selfware.',
};

export default function Story() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 text-center text-sm text-text-muted sm:text-base">
      <p>
        I’ve always been drawn to how systems actually feel to use—the small signals that change whether something helps
        or gets in the way. That focus came from real constraints and a lot of trial and error.
      </p>
      <p>
        Getting sick young forced me to pay attention to patterns: energy, friction, momentum. I learned to notice what
        compounds and what leaks. That became a way of building—make the useful parts obvious, remove the rest, and keep
        iterating.
      </p>
      <p>
        Selfware is the result: a simple, practical layer for context. Track progress, see patterns, and make better
        decisions with clarity. No theatrics—just tools that help you move forward.
      </p>
    </div>
  );
}
