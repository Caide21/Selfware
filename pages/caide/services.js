import { useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import RegistrationModal from '@/components/Modals/RegistrationModal';

const PAGE_HEADING = {
  emoji: "dY'�",
  title: 'Services',
  subtitle:
    'Tailored AI sessions to help you automate, clarify, and evolve using GPT, Notion, and symbolic design.',
};

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionType, setSessionType] = useState('single');

  usePageHeading(PAGE_HEADING);

  const handleFormSubmit = async (formData) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ ...formData, sessionType }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');

      const calURL =
        sessionType === 'package'
          ? 'https://cal.com/caide-taylor/selfware-companion-series'
          : 'https://cal.com/caide-taylor/selfware-ai-session';

      window.location.href = calURL;
    } catch (err) {
      console.error('Registration error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <div className="mx-auto grid max-w-3xl gap-8 px-4 sm:grid-cols-2">
        <ServiceCard
          title="Single Session — R250"
          copy="A one-off AI consulting session to automate, clarify, or ship something fast."
          cta="Book 1 Session"
          onClick={() => {
            setSessionType('single');
            setModalOpen(true);
          }}
        />
        <ServiceCard
          title="Companion Series — R2250"
          copy="Ten-session pack to go deep—build systems, align tooling, and evolve how you think."
          footnote="(R225 per session – save R250)"
          cta="Book 10 Sessions"
          onClick={() => {
            setSessionType('package');
            setModalOpen(true);
          }}
        />
      </div>

      <RegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}

function ServiceCard({ title, copy, footnote, cta, onClick }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="mt-3 text-sm text-text-muted">{copy}</p>
      {footnote ? <p className="mt-2 text-xs text-text-muted">{footnote}</p> : null}
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-cta-accent px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-lg hover:brightness-110"
        onClick={onClick}
      >
        {cta}
      </button>
    </div>
  );
}
