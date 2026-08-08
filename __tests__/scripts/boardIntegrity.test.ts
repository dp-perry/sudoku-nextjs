import { describe, it, expect } from 'vitest'

import { Puzzle, Solution } from '@/types/types'
import { easyBoards, mediumBoards, hardBoards, evilBoards } from '@/lib/boards/boards'
import { easySolutions, mediumSolutions, hardSolutions, evilSolutions } from '@/lib/boards/solutions'
import { stringToBoard, validateBoard, countEmptyCells } from '@/scripts/utils'
import { countSolutions, digitsFromBoard } from '@/scripts/solutionCount'

/**
 * Data integrity for every shipped puzzle.
 *
 * The app compares the player's entry against one stored solution string, so a puzzle
 * with two valid answers actively punishes correct play, and a clue that disagrees with
 * its solution makes the puzzle unwinnable. Neither is visible by looking at the data.
 */

const tiers = [
  {tier: 'easy', puzzles: easyBoards as Puzzle[], solutions: easySolutions as Solution[]},
  {tier: 'medium', puzzles: mediumBoards as Puzzle[], solutions: mediumSolutions as Solution[]},
  {tier: 'hard', puzzles: hardBoards as Puzzle[], solutions: hardSolutions as Solution[]},
  {tier: 'evil', puzzles: evilBoards as Puzzle[], solutions: evilSolutions as Solution[]},
]

/**
 * Puzzles known to be broken and not yet replaced. Listing one here keeps the suite
 * green, and the "known-broken list is still accurate" test below fails the moment a
 * listed puzzle starts passing, so the list cannot quietly rot.
 */
const KNOWN_BROKEN: Record<string, string> = {
  // evil_1 was here — it shipped already solved. Replaced by hand, and this test
  // caught it passing, which is exactly what the mechanism is for.
}

/** Every problem with one puzzle, as human-readable strings. Empty means it is sound. */
const checkPuzzle = (puzzle: Puzzle, solutions: Solution[], tier: string): string[] => {
  const problems: string[] = [];

  const solution = solutions.find((candidate) => candidate.id === puzzle.puzzle_id);
  if (!solution) {
    return [`no solution with id "${puzzle.puzzle_id}"`];
  }

  if (puzzle.url !== `/${tier}/${puzzle.puzzle_id}`) {
    problems.push(`url is "${puzzle.url}", expected "/${tier}/${puzzle.puzzle_id}"`);
  }

  const board = stringToBoard(puzzle.board);
  if ('error' in board) {
    return [...problems, `board string is not 81 digits`];
  }

  const solutionBoard = stringToBoard(solution.board);
  if ('error' in solutionBoard) {
    return [...problems, `solution string is not 81 digits`];
  }

  // The solution has to be a finished, legal grid
  const solutionEmptyCells = countEmptyCells(solutionBoard);
  if (solutionEmptyCells > 0) {
    problems.push(`solution has ${solutionEmptyCells} empty cells, it is not a complete grid`);
  }
  if (!validateBoard(solutionBoard)) {
    problems.push('solution repeats a digit in a row, column or block');
  }

  // A puzzle with nothing to fill in is not a puzzle
  const puzzleEmptyCells = countEmptyCells(board);
  if (puzzleEmptyCells === 0) {
    problems.push('puzzle has no empty cells, it ships already solved');
  }

  // Every clue must agree with the solution, or correct play gets flagged as an error
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const clue = board[r][c].digit;
      if (clue !== 0 && clue !== solutionBoard[r][c].digit) {
        problems.push(`clue ${clue} at r${r}c${c} contradicts solution digit ${solutionBoard[r][c].digit}`);
      }
    }
  }

  // Exactly one answer, or error detection punishes a legitimate solve
  const solutionCount = countSolutions(digitsFromBoard(board), 2);
  if (solutionCount === 0) {
    problems.push('puzzle has no solution at all');
  } else if (solutionCount > 1) {
    problems.push('puzzle has more than one valid solution');
  }

  return problems;
}

describe.each(tiers)('$tier boards', ({tier, puzzles, solutions}) => {
  it('has at least one puzzle', () => {
    expect(puzzles.length).toBeGreaterThan(0);
  })

  it('has no duplicate puzzle ids', () => {
    const ids = puzzles.map((puzzle) => puzzle.puzzle_id);
    expect(ids).toEqual([...new Set(ids)]);
  })

  it('has no orphan solutions', () => {
    const puzzleIds = new Set(puzzles.map((puzzle) => puzzle.puzzle_id));
    const orphans = solutions
      .filter((solution) => !puzzleIds.has(solution.id))
      .map((solution) => solution.id);
    expect(orphans).toEqual([]);
  })

  const sound = puzzles.filter((puzzle) => !(puzzle.puzzle_id in KNOWN_BROKEN));
  it.each(sound)('$puzzle_id is a sound puzzle', (puzzle) => {
    expect(checkPuzzle(puzzle, solutions, tier)).toEqual([]);
  })

  const broken = puzzles.filter((puzzle) => puzzle.puzzle_id in KNOWN_BROKEN);
  if (broken.length > 0) {
    it.each(broken)('$puzzle_id is still on the known-broken list', (puzzle) => {
      const problems = checkPuzzle(puzzle, solutions, tier);
      // If this fails the puzzle has been fixed: drop it from KNOWN_BROKEN
      expect(
        problems,
        `${puzzle.puzzle_id} now passes every check, remove it from KNOWN_BROKEN`
      ).not.toEqual([]);
    })
  }
})

describe('solution counter', () => {
  const digitsFor = (boardString: string) => {
    const board = stringToBoard(boardString);
    if ('error' in board) {
      throw new Error(`test fixture is not a valid board string: ${board.error}`);
    }
    return digitsFromBoard(board);
  }

  it('counts exactly one solution for a proper puzzle', () => {
    expect(countSolutions(
      digitsFor('530070000 600195000 098000060 800060003 400803001 700020006 060000280 000419005 000080079'),
      2
    )).toBe(1);
  })

  it('reports no solution for a contradictory grid', () => {
    // Two 5s in the first row
    expect(countSolutions(
      digitsFor('550070000 600195000 098000060 800060003 400803001 700020006 060000280 000419005 000080079'),
      2
    )).toBe(0);
  })

  it('stops counting once the limit is reached', () => {
    // An empty grid has billions of solutions, the limit has to cap the search
    const empty = Array.from({length: 9}, () => new Array(9).fill(0));
    expect(countSolutions(empty, 2)).toBe(2);
  })
})
