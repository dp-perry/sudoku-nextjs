import { Puzzle } from "@/types/types";
import { easyBoards, mediumBoards, hardBoards, evilBoards } from "@/lib/boards/boards";

export type Difficulty = 'easy' | 'medium' | 'hard' | 'evil';

export type DifficultyInfo = {
  key: Difficulty,
  href: string,
  /** Short label for the menu tile */
  title: string,
  /** Heading on the puzzle list page */
  listTitle: string,
  description: string,
  /** Tailwind classes for the difficulty chip */
  accent: string,
  puzzles: Puzzle[],
}

// Single source of truth for the four difficulty tiers. The list pages and the menu
// both read from here, so a description only has to be written once.
export const difficulties: DifficultyInfo[] = [
  {
    key: 'easy',
    href: '/easy',
    title: 'Easy',
    listTitle: 'Easy Sudoku Puzzles',
    description: 'These require no special techniques or guessing',
    accent: 'bg-emerald-100 text-emerald-800',
    puzzles: easyBoards,
  },
  {
    key: 'medium',
    href: '/medium',
    title: 'Medium',
    listTitle: 'Medium Sudoku Puzzles',
    description: 'A step up, notes start to earn their keep',
    accent: 'bg-sky-100 text-sky-800',
    puzzles: mediumBoards,
  },
  {
    key: 'hard',
    href: '/hard',
    title: 'Hard',
    listTitle: 'Hard Sudoku Puzzles',
    description: 'Expect to lean on pairs, triples and pointing pairs',
    accent: 'bg-amber-100 text-amber-800',
    puzzles: hardBoards,
  },
  {
    key: 'evil',
    href: '/evil',
    title: 'Evil',
    listTitle: 'Evil Sudoku Puzzles',
    description: 'The hardest set, for when nothing else bites',
    accent: 'bg-rose-100 text-rose-800',
    puzzles: evilBoards,
  },
]

export const getDifficulty = (key: Difficulty) =>
  difficulties.find((difficulty) => difficulty.key === key)!;
