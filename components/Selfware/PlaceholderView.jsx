import Link from 'next/link';
import Head from 'next/head';
import Card from '@/components/CardKit/Card';
import GhostButton from '@/components/ui/GhostButton';
import { usePageHeading } from '@/components/Layout/PageShell';

export default function PlaceholderView({
  title,
  subtitle,
  description,
  modules = [],
  backHref = '/character-portal',
  backLabel = 'Back to Character Portal',
}) {
  usePageHeading({
    emoji: '',
    title,
    subtitle,
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <section className="mx-auto max-w-6xl space-y-8">
        <Card
          title={title}
          subtitle="Frontend shell"
          variant="neutral"
          accent="#22d3ee"
          className="text-left"
        >
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text/75 sm:text-base">
            {description}
          </p>
          <div className="mt-5">
            <GhostButton href={backHref}>{backLabel}</GhostButton>
          </div>
        </Card>

        {modules.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <Card
                key={module.title}
                title={module.title}
                variant="neutral"
                accent={module.accent ?? ['#60a5fa', '#34d399', '#f59e0b'][index % 3]}
                className="h-full text-left [&_h3]:text-base"
              >
                <p className="mt-2 text-sm text-text/70">{module.copy}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card title="No modules wired yet" variant="neutral" accent="#94a3b8" className="text-left">
            <p className="mt-2 text-sm text-text/70">
              This route is ready for future shared data. Nothing is connected yet.
            </p>
          </Card>
        )}
      </section>
    </>
  );
}

export function PortalCard({ href, title, copy, accent }) {
  return (
    <Link href={href} className="block h-full">
      <Card
        title={title}
        variant="neutral"
        accent={accent}
        interactive
        className="h-full text-left [&_h3]:text-lg"
      >
        <p className="mt-3 text-sm text-text/70">{copy}</p>
      </Card>
    </Link>
  );
}
