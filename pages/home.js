import SectionBand from '@/components/Surface/SectionBand';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GhostButton from '@/components/ui/GhostButton';
import Chip from '@/components/ui/Chip';
import Card from '@/components/CardKit/Card';

const MIRROR_POINTS = [
  {
    title: 'Thought Loops',
    copy:
      "Recurring thoughts get a place to land, so they can be seen clearly instead of circling in the background.",
  },
  {
    title: 'Emotional Signals',
    copy:
      "Moods, resistance, capacity, and focus become readable signals instead of vague internal weather.",
  },
  {
    title: 'Repeated Patterns',
    copy:
      "Behavioral loops surface over time, making them easier to work with instead of carrying them blindly.",
  },
];

const SYSTEM_MODULES = [
  {
    title: 'Quests',
    copy:
      "Turn intentions into visible missions with progress, friction, and next actions held in one place.",
  },
  {
    title: 'Notes',
    copy:
      "Capture fragments before they vanish: ideas, observations, plans, and useful sparks from the day.",
  },
  {
    title: 'Reflections',
    copy:
      "Review what happened, what shifted, what mattered, and what the next loop should learn.",
  },
  {
    title: 'Patterns',
    copy:
      "Connect repeated signals across thoughts, emotion, behavior, and attention so the system can show what keeps returning.",
  },
  {
    title: 'Rituals',
    copy:
      "Build repeatable sequences for entering focus, closing loops, regulating state, and returning to the work.",
  },
  {
    title: 'Codex',
    copy:
      "Store principles, symbols, methods, and hard-won insights as a living reference for future decisions.",
  },
];

const ORIGIN_POINTS = [
  {
    title: 'Real Friction',
    copy:
      "Selfware is shaped around Caide's actual days: scattered ideas, emotional shifts, open loops, creative pressure, and unfinished systems.",
  },
  {
    title: 'Real Iteration',
    copy:
      "The interface changes when the workflow proves something. Useful patterns stay. Decorative noise gets cut.",
  },
  {
    title: 'Built to Generalize Later',
    copy:
      "It starts with one real human operating system before becoming something broader. Specific first, honest always.",
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
          First Contact
        </Chip>
        <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Command center online.
        </h1>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Selfware is a personal operating system that turns your inner world into something you can
          see, shape, and improve.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-text/70 sm:text-base">
          Bring the scattered pieces: the quests, the notes, the loops, the signals. Selfware helps
          turn them into a calm working system without pretending the machine is magic.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <PrimaryButton href="/dashboard">Enter the System</PrimaryButton>
          <GhostButton href="#the-system">View the Modules</GhostButton>
        </div>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-text-muted"
        >
          <span>Open the map</span>
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
            The Mirror
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Make the inner world visible
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Selfware helps catch thoughts, emotions, behaviors, and repeated loops so they can be
            worked with directly instead of carried blindly.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {MIRROR_POINTS.map((step, idx) => (
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
    <section id="the-system" className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            The System
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Practical modules for a living interface
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            The atmosphere can feel alive, but the tools stay practical. Each module gives a different
            part of the inner operating system somewhere useful to go.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SYSTEM_MODULES.map((feature, idx) => (
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
            The Caide Origin
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Built around one real workflow first
          </h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Selfware is being built around Caide&apos;s real friction, reflection, systems, and iteration
            before it tries to become a broader tool.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {ORIGIN_POINTS.map((point, idx) => (
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
          Start with one signal.
        </h2>
        <p className="text-base text-text-muted sm:text-lg">
          Open the command center, add one honest piece of information, and let the system begin
          turning scattered input into shape.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryButton href="/dashboard">Open the Command Center</PrimaryButton>
          <GhostButton href="/codex">Enter the Codex</GhostButton>
        </div>
      </div>
    </section>
  );
}

Home.showCorridorSpine = false;
Home.psytrip = true;
