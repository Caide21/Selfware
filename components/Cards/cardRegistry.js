import HabitCard from '@/components/Cards/HabitCard';
import QuestCard from '@/components/Cards/QuestCard';
import StatCard from '@/components/Cards/StatCard';
import NoteCard from '@/components/Cards/NoteCard';
import InventoryCard from '@/components/Cards/InventoryCard';
import LoadoutCard from '@/components/Cards/LoadoutCard';
import MindFunctionCard from '@/components/Cards/MindFunctionCard';
import ProjectCard from '@/components/Cards/ProjectCard';
import PersonCard from '@/components/Cards/PersonCard';
import RitualCard from '@/components/Cards/RitualCard';
import EventCard from '@/components/Cards/EventCard';
import EmotionCard from '@/components/Cards/EmotionCard';
import EmotionalStateCard from '@/components/Cards/EmotionalStateCard';
import HomeCard from '@/components/Cards/HomeCard';

export const CARD_REGISTRY = {
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

export function renderCard(card) {
  const Component = CARD_REGISTRY[card?.type];
  if (!Component) return null;
  return <Component card={card} />;
}
