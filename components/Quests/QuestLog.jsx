export default function QuestLog({ quests }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {quests.map(quest => (
        <ParchmentWrapper key={quest.slug}>
          <QuestCard quest={quest} />
        </ParchmentWrapper>
      ))}
    </div>
  );
}
