import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthStatus from '../nav/AuthStatus';
import NavBar from '../NavBar';

const NAV_LINKS = [
  { href: '/mind-arsenal', label: 'Mind Arsenal' },
  { href: '/loadouts', label: 'Loadouts' },
  { href: '/status_panel', label: 'Status Panel' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/quests', label: 'Quests' },
];

const DROPDOWN_LINKS = [
  { href: '/join', label: 'Join' },
  { href: '/caide', label: 'Caide' },
];

const baseLinkClass =
  'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200';

export default function Nav() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hoverTimeout = useRef(null);

  const isActive = (href) => router?.pathname?.startsWith(href);

  const cancelScheduledClose = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    hoverTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
      hoverTimeout.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => cancelScheduledClose();
  }, []);

  return (
    <nav className="z-50 px-4 pt-4 sm:px-6">
      <NavBar>
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-text">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-teal-400 to-rose-400 opacity-90" />
            <span className="text-base font-semibold tracking-[0.25em] text-text sm:text-lg">Selfware</span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    baseLinkClass,
                    active ? 'bg-white text-text shadow-lg' : 'text-text/70 hover:text-text hover:bg-white/70',
                  ].join(' ')}
                >
                  <span>{link.label}</span>
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-teal-400" />
                  ) : null}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => {
                cancelScheduledClose();
                setIsDropdownOpen(true);
              }}
              onMouseLeave={scheduleClose}
              onFocusCapture={() => {
                cancelScheduledClose();
                setIsDropdownOpen(true);
              }}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  scheduleClose();
                }
              }}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                className={[
                  baseLinkClass,
                  isDropdownOpen ? 'bg-white text-text shadow-lg' : 'text-text/70 hover:text-text hover:bg-white/70',
                ].join(' ')}
                onClick={() => {
                  cancelScheduledClose();
                  setIsDropdownOpen((prev) => !prev);
                }}
              >
                <span>More</span>
                <svg
                  viewBox="0 0 12 12"
                  className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path
                    d="M2 4.5L6 8.5L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isDropdownOpen ? (
                <div
                  className="absolute right-0 top-12 w-48 rounded-2xl border border-white/50 bg-white/95 p-3 shadow-xl backdrop-blur"
                  onMouseEnter={cancelScheduledClose}
                  onMouseLeave={scheduleClose}
                >
                  <ul className="flex flex-col gap-1 text-sm font-medium text-text/70">
                    {DROPDOWN_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-section hover:text-text transition"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {link.label}
                          <span className="text-[10px] uppercase tracking-wide text-text/50">↗</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 lg:flex-none">
            <span className="hidden rounded-full bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.5em] text-text/60 lg:inline-flex">
              HUD
            </span>
            <AuthStatus />
          </div>
        </div>
      </NavBar>
    </nav>
  );
}
