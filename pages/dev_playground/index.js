import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: '🧪',
  title: 'Dev Playground',
  subtitle: 'Habit card prototype using Status Panel chrome',
};

const MOCK_HABIT = {
  id: 'habit-morning-stretch',
  title: 'Morning stretch (5 minutes)',
  description: 'Light full-body stretch to wake up the system.',
  frequency: 'daily',
  scheduleSummary: 'Daily · morning',
  streakCount: 14,
  bestStreak: 21,
  xpValue: 5,
  todayStatus: 'pending',
  lastCompletedLabel: 'yesterday',
};

const statusClasses = {
  pending: 'border-cyan-400/70',
  done: 'border-emerald-400/80 bg-emerald-50/40',
  skipped: 'border-slate-300/70 opacity-80',
  not_scheduled: 'border-slate-200/70',
};

const statusLabelMap = {
  pending: 'Pending',
  done: 'Done',
  skipped: 'Skipped',
  not_scheduled: 'Not today',
};

const statusChipClasses = {
  pending: 'text-cyan-700 border-cyan-300/80 bg-cyan-50/70',
  done: 'text-emerald-700 border-emerald-300/80 bg-emerald-50/70',
  skipped: 'text-slate-600 border-slate-300/80 bg-slate-50',
  not_scheduled: 'text-slate-600 border-slate-200/80 bg-slate-50',
};

function HabitCard({ habit }) {
  const baseCardClasses = 'w-full max-w-md rounded-2xl p-3 border space-y-3';
  const hoverClasses =
    'transition-transform transition-shadow duration-150 ease-out hover:-translate-y-[1px] hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]';
  const frequencyLabel =
    habit.frequency === 'daily' ? 'Daily' : habit.frequency === 'weekly' ? 'Weekly' : 'Custom';

  return (
    <div
      className={`${baseCardClasses} ${statusClasses[habit.todayStatus] || ''} ${hoverClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm sm:text-base font-medium text-slate-900">{habit.title}</div>
        <div className="inline-flex items-center rounded-full border border-cyan-300/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-cyan-700">
          {frequencyLabel}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-cyan-600">{habit.streakCount}</div>
          <div className="text-xs text-slate-500">
            day streak{habit.bestStreak ? ` · best: ${habit.bestStreak}` : ''}
          </div>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
            statusChipClasses[habit.todayStatus] || ''
          }`}
        >
          {statusLabelMap[habit.todayStatus] || statusLabelMap.pending}
        </div>
      </div>

      {habit.description ? <div className="text-xs text-slate-600">{habit.description}</div> : null}

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">{habit.scheduleSummary}</div>
        <div className="text-xs text-slate-400">Last done: {habit.lastCompletedLabel}</div>
      </div>
    </div>
  );
}

export default function DevPlaygroundPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <HabitCard habit={MOCK_HABIT} />
    </div>
  );
}
