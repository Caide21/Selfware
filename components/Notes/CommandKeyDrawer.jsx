import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const COMMAND_GROUPS = [
  {
    title: 'Finance',
    description: 'Track money movement. Format: command, amount, then category or short description.',
    commands: [
      { example: '/income 650 tips', note: 'Log money coming in.' },
      { example: '/expense 150 diesel', note: 'Log money leaving the system.' },
      { example: '/savings 2000 moveout', note: 'Log money moved into savings.' },
      { example: '/moveout 500 fridge', note: 'Track a move-out fund item.' },
    ],
  },
  {
    title: 'Waitering',
    description: 'Capture shift numbers. Table format is table, bill total, amount tendered.',
    commands: [
      { example: '/table 308 857 957', note: 'Log a table payment and tip.' },
      { example: '/cashup 7000 800 100', note: 'Log turnover, retained amount, and cash.' },
    ],
  },
  {
    title: 'Writing',
    description: 'Turn raw thoughts into useful records, quests, or reflections.',
    commands: [
      { example: '/note plain note text', note: 'Keep a plain note-shaped entry.' },
      { example: '/reflect reflection text', note: 'Capture reflection material.' },
      { example: '/quest Save R55k move-out fund', note: 'Shape a goal into a quest.' },
    ],
  },
];

export default function CommandKeyDrawer({ className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={[
        'rounded-lg border border-white/10 bg-white/[0.04] shadow-[0_0_20px_rgba(148,163,184,0.08)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-text/80 transition hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-cta-accent/40"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <HelpCircle aria-hidden className="h-4 w-4 text-cta-accent" />
          Command key
        </span>
        <ChevronDown
          aria-hidden
          className={[
            'h-4 w-4 text-text/45 transition-transform',
            open ? 'rotate-180 text-text/70' : '',
          ].join(' ')}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-white/10 px-3 py-3">
          <p className="text-xs leading-relaxed text-text/55">
            Start a note with a slash command when you want Selfware to structure the signal. Plain notes still work.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {COMMAND_GROUPS.map((group) => (
              <section key={group.title} className="rounded-md border border-white/10 bg-black/10 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-text/55">{group.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-text/55">{group.description}</p>
                <div className="mt-3 space-y-2">
                  {group.commands.map((command) => (
                    <div key={command.example} className="space-y-1">
                      <code className="block overflow-x-auto rounded bg-white/10 px-2 py-1 text-xs text-text">
                        {command.example}
                      </code>
                      <div className="text-[11px] leading-relaxed text-text/45">{command.note}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
