import { useEffect, useMemo, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import SectionNav from '@/components/MindArsenal/SectionNav';
import EntryCard from '@/components/MindArsenal/EntryCard';
import { useMindArsenalStore, mindArsenalSections } from '@/stores/mindArsenal';

const PAGE_HEADING = {
  emoji: '\uD83E\uDDE0',
  title: 'Mind Arsenal',
  subtitle: 'Curate abilities, codex entries, and blueprints that shape your inner operating system.',
};

export default function MindArsenalPage() {
  const [activeSection, setActiveSection] = useState(null);
  const sections = useMindArsenalStore((state) => state.sections);

  usePageHeading(PAGE_HEADING);

  const resolvedSections = useMemo(() => {
    if (!sections || sections.length === 0) {
      return mindArsenalSections;
    }
    return sections;
  }, [sections]);

  useEffect(() => {
    if (resolvedSections.length === 0) return;

    const activeExists = resolvedSections.some((section) => section.id === activeSection);
    if (!activeSection || !activeExists) {
      setActiveSection(resolvedSections[0].id);
    }
  }, [activeSection, resolvedSections]);

  const entries = useMindArsenalStore((state) =>
    activeSection ? state.entries[activeSection] ?? [] : []
  );

  const activeMeta = useMemo(
    () => resolvedSections.find((section) => section.id === activeSection),
    [resolvedSections, activeSection]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-8">
        <aside className="lg:w-72 flex-shrink-0">
          <SectionNav
            sections={resolvedSections}
            activeId={activeSection}
            onSelect={(id) => setActiveSection(id)}
          />
        </aside>

        <main className="flex-1 space-y-6">
          <header className="border border-white/10 rounded-2xl bg-white/5 px-6 py-4">
            {activeMeta ? (
              <>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>{activeMeta.icon ?? '\u2728'}</span>
                  <span>{activeMeta.label ?? 'Selected Section'}</span>
                </h2>
                <p className="text-sm text-white/70 mt-2">
                  {activeMeta.description ?? 'Select a module to view its entries.'}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/70">Select a section to begin exploring your arsenal.</p>
            )}
          </header>

          {entries.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  title={entry.title}
                  summary={entry.summary}
                  status={entry.status}
                  tags={entry.tags}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-white/20 rounded-2xl bg-white/5 px-6 py-16 text-center">
              <p className="text-sm text-white/70">
                Nothing logged yet. Capture your first entry to start filling this chamber.
              </p>
            </div>
          )}
        </main>

        <aside className="lg:w-64 flex-shrink-0 space-y-4">
          <div className="border border-white/10 rounded-2xl bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Quick Pins</h3>
            <p className="text-xs text-white/60 mt-2">
              When you mark an entry as pinned, it will surface here for rapid access.
            </p>
          </div>
          <div className="border border-white/10 rounded-2xl bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Linked Threads</h3>
            <p className="text-xs text-white/60 mt-2">
              Future iterations will weave connections between abilities, codex notes, and blueprints.
            </p>
          </div>
        </aside>
    </div>
  );
}


