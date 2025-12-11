import Link from 'next/link';
import SectionBand from '@/components/Surface/SectionBand';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GhostButton from '@/components/ui/GhostButton';
import Chip from '@/components/ui/Chip';
import Card from '@/components/CardKit/Card';

const STEPS = [
  {
    title: 'Frame the day',
    copy:
      "Pick the quests, habits, and rituals that matter now. Your HUD locks today's priorities into a simple plan.",
  },
  {
    title: 'Equip your kit',
    copy:
      "Loadouts bundle tools, focus modes, and reminders into repeatable presets so you drop straight into flow.",
  },
  {
    title: 'Play the loop',
    copy:
      "Log reps as XP, watch the scorecard update, and catch momentum shifts before they derail your day.",
  },
];

const FEATURES = [
  {
    title: 'Reality-first interfaces',
    copy:
      "Interfaces that stay in sync with what actually happened—not what you hoped would.",
  },
  {
    title: 'Numbers that remember why',
    copy:
      "Each interface carries its own story, intent, and reflections, and syncs with the rest—so your numbers stay linked to the decisions behind them and the bigger picture.",
  },
  {
    title: 'Ambient accountability',
    copy:
      "Lightweight cues. Timely nudges keep focus intact and your attention unbroken.",
  },
];

const PROOF_POINTS = [
  {
    title: 'Continuous momentum',
    copy:
      "Stalled tasks show up early, so you can turn them into deliberate missions that build skill instead of background guilt.",
  },
  {
    title: 'Learn without burnout',
    copy:
      "Ritual tracking highlights what sustains focus, grades, and portfolio pieces over time.",
  },
  {
    title: 'Make progress visible',
    copy:
      "XP turns invisible reps into honest movement-toward meaningful launches, revenue, reputation, and mastery.",
  },
];

const STEP_ACCENTS = ['#22d3ee', '#fbbf24', '#22c55e'];
const FEATURE_ACCENTS = ['#60a5fa', '#a78bfa', '#34d399'];
const PROOF_ACCENTS = ['#fb7185', '#f59e0b', '#38bdf8'];

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProofSection />
      <FinalCTA />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Chip className="bg-white/90 text-xs uppercase tracking-[0.45em] text-text-muted">
          Selfware • RealityHUD
        </Chip>
        <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Make your day playable.
        </h1>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Selfware is a heads-up display for real life. Set the mission, equip the right mindset, loadouts,
          while keeping progress visible and actionable from first move to last.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <PrimaryButton href="/join">Request Early Access</PrimaryButton>
          <GhostButton href="#how-it-works">See how it works</GhostButton>
        </div>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-text-muted"
        >
          <span>See the steps</span>
          <span aria-hidden>?</span>
        </a>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <SectionBand
      id="how-it-works"
      size="lg"
      style={{ '--band-bg': 'transparent', '--band': 'none' }}
    >
      <div className="flex flex-col gap-10 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            How it works
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Your day in three moves
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
          RealityHUD turns your day into a simple loop: decide what matters, equip the right loadouts, then track what actually happened.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, idx) => (
            <Card
              key={step.title}
              title={step.title}
              variant="neutral"
              accent={STEP_ACCENTS[idx % STEP_ACCENTS.length]}
              className="h-full text-left [&_h3]:text-lg"
            >
              <p className="mt-3 text-sm text-text/75">{step.copy}</p>
            </Card>
          ))}
        </div>
      </div>
    </SectionBand>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            Product foundations
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Built for momentum you can feel
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Calm surfaces. Honest feedback. Every feature supports the loop from action to review, so you always know what happened and what to adjust next.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <Card
              key={feature.title}
              title={feature.title}
              variant="neutral"
              accent={FEATURE_ACCENTS[idx % FEATURE_ACCENTS.length]}
              className="h-full text-left transition hover:-translate-y-1 [&_h3]:text-lg"
            >
              <p className="mt-3 text-sm text-text/75">{feature.copy}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            Outcomes
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Progress that’s hard to ignore
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            For anyone who works, studies, and creates in the same day—and needs a clear picture of how it all actually unfolded in one place.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROOF_POINTS.map((point, idx) => (
            <Card
              key={point.title}
              title={point.title}
              variant="neutral"
              accent={PROOF_ACCENTS[idx % PROOF_ACCENTS.length]}
              className="h-full text-left [&_h3]:text-base"
            >
              <p className="mt-2 text-sm text-text/75">{point.copy}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-semibold text-text sm:text-4xl">
          Start with one mission. Keep the day in view.
        </h2>
        <p className="text-base text-text-muted sm:text-lg">
          Join early access, map your first mission, and feel the difference when the HUD keeps focus and feedback in one view.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryButton href="/join">Join the waitlist</PrimaryButton>
          <GhostButton href="/caide">Meet the team</GhostButton>
        </div>
      </div>
    </section>
  );
}

Home.showCorridorSpine = false;
Home.psytrip = true;
