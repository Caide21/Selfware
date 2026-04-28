import type { ReactElement } from 'react';
import HabitCard from './HabitCard';
import QuestCard from './QuestCard';
import StatCard from './StatCard';
import NoteCard from './NoteCard';
import InventoryCard from './InventoryCard';
import LoadoutCard from './LoadoutCard';
import MindFunctionCard from './MindFunctionCard';
import ProjectCard from './ProjectCard';
import PersonCard from './PersonCard';
import RitualCard from './RitualCard';
import EventCard from './EventCard';
import EmotionCard from './EmotionCard';
import EmotionalStateCard from './EmotionalStateCard';
import HomeCard from './HomeCard';

type CardComponent = (props: any) => ReactElement | null;

export const CARD_REGISTRY: Record<string, CardComponent> = {
  habit: HabitCard,
  quest: QuestCard,
  stat: StatCard,
  note: NoteCard,
  inventory: InventoryCard,
  loadout: LoadoutCard,
  mindFunction: MindFunctionCard,
  project: ProjectCard,
  person: PersonCard,
  ritual: RitualCard,
  event: EventCard,
  emotion: EmotionCard,
  emotionalState: EmotionalStateCard,
  home: HomeCard,
};

export function renderCard(card: any) {
  const Component = card?.type ? CARD_REGISTRY[card.type] : null;
  if (!Component) return null;
  return <Component card={card} />;
}
