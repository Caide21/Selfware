import Link from 'next/link';
import AuthStatus from '../nav/AuthStatus';

export default function ShellControls() {
  return (
    <>
      <div className="fixed left-3 top-3 z-50 flex max-w-[calc(100vw-8.5rem)] flex-wrap items-center gap-2 sm:left-5 sm:top-5 sm:max-w-[calc(100vw-12rem)]">
        <AuthStatus className="max-w-full text-xs shadow-[0_0_18px_rgba(148,163,184,0.10)] sm:text-sm" />
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="rounded-full border border-white/10 bg-white/20 px-3 py-1.5 text-xs font-medium text-text/45 backdrop-blur-md shadow-[0_0_18px_rgba(148,163,184,0.08)] disabled:cursor-not-allowed sm:text-sm"
        >
          Settings
        </button>
      </div>

      <Link
        href="/character-portal"
        className="fixed right-3 top-3 z-50 rounded-full border border-white/10 bg-white/20 px-3 py-1.5 text-xs font-medium text-text/80 backdrop-blur-md shadow-[0_0_18px_rgba(148,163,184,0.10)] transition hover:bg-white/30 hover:text-text sm:right-5 sm:top-5 sm:text-sm"
      >
        Portal Room
      </Link>
    </>
  );
}
