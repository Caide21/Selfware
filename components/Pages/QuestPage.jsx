import ParchmentWrapper from '@/components/Layout/ParchmentWrapper'

export default function QuestPage({ title, description, progress, ritualSteps }) {
  return (
    <ParchmentWrapper>
      <h1 className="text-2xl sm:text-4xl font-bold mb-2">{title}</h1>
      <p className="mb-4">{description}</p>

      <h2>Progress</h2>
      <div className="bg-theme-muted/30 h-2 rounded-full mb-4">
        <div
          className="bg-theme-success h-2 rounded-full"
          style={{ width: `${progress || 0}%` }}
        />
      </div>

      {ritualSteps && ritualSteps.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-1">Ritual Steps</h2>
          <ul className="list-disc list-inside">
            {ritualSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </>
      )}
    </ParchmentWrapper>
  )
}
