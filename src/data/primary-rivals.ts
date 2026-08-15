import type { AxisPositions, Party, TraitId } from '../engine/types';

export interface PrimaryRivalDef {
  id: string;
  name: string;
  party: Party;
  positions: AxisPositions;
  traits: TraitId[];
  nameRecognition: number;
  warChest: number;
}

/** 4 fictional rivals per major party. Independent candidates skip the
 * primary structure entirely (see engine/primary.ts), so there is no
 * independent roster. */
export const PRIMARY_RIVALS: Record<'democrat' | 'republican', PrimaryRivalDef[]> = {
  democrat: [
    {
      id: 'alicia_ferro',
      name: 'Alicia Ferro',
      party: 'democrat',
      positions: { economy: -30, immigration: -25, healthcare: -30, crime: 5, climate: -25, foreign: -5, social: -20, government_reform: -10 },
      traits: ['machine_politician', 'conciliator'],
      nameRecognition: 45,
      warChest: 20_000_000,
    },
    {
      id: 'devon_marsh',
      name: 'Devon Marsh',
      party: 'democrat',
      positions: { economy: -70, immigration: -60, healthcare: -75, crime: -55, climate: -80, foreign: -35, social: -75, government_reform: -30 },
      traits: ['policy_wonk', 'debater'],
      nameRecognition: 50,
      warChest: 15_000_000,
    },
    {
      id: 'louis_tran',
      name: 'Louis Tran',
      party: 'democrat',
      positions: { economy: -25, immigration: -20, healthcare: -25, crime: 15, climate: -20, foreign: 0, social: -15, government_reform: -5 },
      traits: ['conciliator', 'media_savvy'],
      nameRecognition: 20,
      warChest: 6_000_000,
    },
    {
      id: 'carla_nunez',
      name: 'Carla Nunez',
      party: 'democrat',
      positions: { economy: -60, immigration: -20, healthcare: -50, crime: -10, climate: -25, foreign: -15, social: -20, government_reform: -25 },
      traits: ['machine_politician', 'debater'],
      nameRecognition: 25,
      warChest: 8_000_000,
    },
  ],
  republican: [
    {
      id: 'bill_ashcroft',
      name: 'Bill Ashcroft',
      party: 'republican',
      positions: { economy: 35, immigration: 35, healthcare: 30, crime: 35, climate: 30, foreign: 40, social: 35, government_reform: 25 },
      traits: ['machine_politician', 'debater'],
      nameRecognition: 50,
      warChest: 22_000_000,
    },
    {
      id: 'trent_kowalczyk',
      name: 'Trent Kowalczyk',
      party: 'republican',
      positions: { economy: 15, immigration: 65, healthcare: 20, crime: 55, climate: 35, foreign: 25, social: 50, government_reform: 30 },
      traits: ['charismatic', 'outsider'],
      nameRecognition: 40,
      warChest: 14_000_000,
    },
    {
      id: 'kim_sorensen',
      name: 'Kim Sorensen',
      party: 'republican',
      positions: { economy: 25, immigration: 45, healthcare: 15, crime: 40, climate: 20, foreign: 80, social: 30, government_reform: 15 },
      traits: ['war_hero', 'debater'],
      nameRecognition: 30,
      warChest: 9_000_000,
    },
    {
      id: 'roy_falkner',
      name: 'Roy Falkner',
      party: 'republican',
      positions: { economy: 65, immigration: 5, healthcare: 55, crime: -5, climate: 10, foreign: -25, social: -10, government_reform: 80 },
      traits: ['outsider', 'fundraiser'],
      nameRecognition: 22,
      warChest: 30_000_000,
    },
  ],
};
