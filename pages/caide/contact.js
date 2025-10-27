import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY"�',
  title: 'Contact',
  subtitle: 'Questions, projects, or collaborations—feel free to reach out.',
};

export default function Contact() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 text-center text-sm text-text-muted sm:text-base">
      <p>
        Email:{' '}
        <a href="mailto:your@email.com" className="font-medium text-info hover:underline">
          your@email.com
        </a>
      </p>
      <p>
        Instagram:{' '}
        <a href="https://instagram.com/selfware.space" className="font-medium text-info hover:underline">
          @selfware.space
        </a>
      </p>
      <p>
        Telegram: <span className="font-medium text-text">caide_systems</span>
      </p>
    </div>
  );
}
