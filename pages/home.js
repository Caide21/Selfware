import Link from 'next/link';
import SectionBand from '@/components/Surface/SectionBand';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GhostButton from '@/components/ui/GhostButton';
import Chip from '@/components/ui/Chip';

const STEPS = [
  {
    title: 'Frame the day',
    copy:
      "Pick the quests, habits, and rituals that matter now. Your HUD locks today’s priorities into a simple plan.",
  },
  {
    title: 'Equip your kit',
    copy:
      "Loadouts bundle tools, focus modes, and reminders into repeatable presets so you drop straight into flow.",
  },
  {
    title: 'Play the loop',
    copy:
      "Log reps as XP, watch the scorecard pulse, and adjust fast—before small drifts turn into stall.",
  },
];

const FEATURES = [
  {
    title: 'Reality-first dashboards',
    copy:
      "Status panels and mirrors stay in sync with what actually happened—not what you hoped would.",
  },
  {
    title: 'Context that travels with data',
    copy:
      "Each metric carries its narrative—loadout notes, quest intent, and reflection prompts—so numbers mean something.",
  },
  {
    title: 'Ambient accountability',
    copy:
      "Lightweight cues, not modal sludge. Timely nudges keep focus intact and your attention unbroken.",
  },
];

const PROOF_POINTS = [
  {
    title: 'Ship daily with less thrash',
    copy:
      "Early signals of stalled tasks redirect energy to what moves the needle, so momentum compounds.",
  },
  {
    title: 'Study without burnout',
    copy:
      "Ritual tracking highlights the inputs that sustain focus, grades, and portfolio pieces over time.",
  },
  {
    title: 'Make progress visible',
    copy:
      "XP turns invisible reps into honest movement—toward launches, revenue, reputation, and mastery.",
  },
];

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
          Selfware is a heads-up display for real life. Set the mission, equip the right rituals and tools,
          and keep progress visible from first move to reflection—without noisy dashboards or busywork.
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
          <span aria-hidden>↓</span>
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
            RealityHUD keeps the signal clear: frame the day, pull the right loadouts, and let the scorecard guide pace while you build.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="card h-full p-6 text-left">
              <h3 className="text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-3 text-sm text-text/75">{step.copy}</p>
            </div>
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
            Product signal
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Built for momentum you can feel
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Calm surfaces. Honest feedback. Every feature serves the loop from action to review—no noise, no drag.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="card h-full p-6 text-left transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 text-sm text-text/75">{feature.copy}</p>
            </div>
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
            For founders, students, and makers who ship, study, and steward creative work in the same day—and need signal, not noise.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div key={point.title} className="card h-full p-6 text-left">
              <h3 className="text-base font-semibold text-text">{point.title}</h3>
              <p className="mt-2 text-sm text-text/75">{point.copy}</p>
            </div>
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
          Start with one mission. Keep the signal clean.
        </h2>
        <p className="text-base text-text-muted sm:text-lg">
          Join early access, map your first quest, and feel the difference when the HUD keeps focus and feedback in one view.
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
