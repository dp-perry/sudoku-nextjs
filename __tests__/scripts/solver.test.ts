import { describe, it, expect } from 'vitest'

import { Board, GridLoc } from '@/types/types'
import { stringToBoard, boardToString, countEmptyCells } from '@/scripts/utils'
import {
  sudokuSolver,
  solveHiddenSingles,
  findNakedPairs,
  findNakedTriples,
  findPointingPairs,
} from '@/scripts/solver'

/**
 * Fixtures set candidates explicitly rather than letting getAllNotes derive them, so a
 * test asserts one strategy's behaviour and nothing else.
 *
 * Cells not named in `notes` are filled with a digit, which every strategy skips. The
 * strategies never check that the digits form a legal grid, so the filler value is
 * arbitrary.
 */
const buildBoard = (notes: Record<string, number[]>): Board => {
  const board: Board = [];
  for (let r = 0; r < 9; r++) {
    board.push([]);
    for (let c = 0; c < 9; c++) {
      const candidates = notes[`${r}${c}`];
      board[r].push(
        candidates
          ? {digit: 0, state: 'free', notes: new Set(candidates)}
          : {digit: 1, state: 'locked', notes: new Set<number>()}
      );
    }
  }
  return board;
}

const candidatesAt = (board: Board, {r, c}: GridLoc) => [...board[r][c].notes].sort((a, b) => a - b);

const COMPLETE_GRID =
  '698273145 157946238 432851976 874135692 916782453 523469817 741528369 265394781 389617524';

/** The complete grid with one cell blanked per listed row, so each hole is a naked single */
const gridWithHoles = (holes: GridLoc[]): Board => {
  const board = stringToBoard(COMPLETE_GRID);
  if ('error' in board) {
    throw new Error('COMPLETE_GRID fixture is not a valid board string');
  }
  for (const hole of holes) {
    board[hole.r][hole.c].digit = 0;
    board[hole.r][hole.c].state = 'free';
  }
  return board;
}

const blankBoard = (): Board => stringToBoard(new Array(9).fill('000000000').join(' ')) as Board;

describe('made_changes reports whether the board actually changed', () => {
  /**
   * The regression test for the whole rewrite. These strategies used to report progress
   * for *spotting* a pattern, so a board with a stable naked pair claimed progress on
   * every round and the solve loop could never conclude it was stuck.
   */

  it('findNakedPairs reports no change on the second run', () => {
    const board = buildBoard({'00': [1, 2], '01': [1, 2], '02': [1, 2, 3]});

    expect(findNakedPairs(board).made_changes).toBe(true);
    expect(findNakedPairs(board).made_changes).toBe(false);
  })

  it('findNakedTriples reports no change on the second run', () => {
    const board = buildBoard({'00': [1, 2], '01': [2, 3], '02': [1, 3], '03': [3, 4]});

    expect(findNakedTriples(board).made_changes).toBe(true);
    expect(findNakedTriples(board).made_changes).toBe(false);
  })

  it('findPointingPairs reports no change on the second run', () => {
    // 5 is confined to row 0 of block 0, so it can go from the rest of row 0
    const board = buildBoard({'00': [5, 6], '01': [5, 7], '04': [5, 8]});

    expect(findPointingPairs(board).made_changes).toBe(true);
    expect(findPointingPairs(board).made_changes).toBe(false);
  })

  it('solveHiddenSingles reports no change once the board is full', () => {
    const board = gridWithHoles([{r: 0, c: 0}]);
    // A hole that is the only gap in its row has exactly one candidate
    board[0][0].notes = new Set([6]);

    expect(solveHiddenSingles(board).made_changes).toBe(true);
    expect(solveHiddenSingles(board).made_changes).toBe(false);
  })
})

describe('naked pairs', () => {
  it('strips the pair from the rest of the row', () => {
    const board = buildBoard({'00': [1, 2], '01': [1, 2], '02': [1, 2, 3]});

    findNakedPairs(board);

    expect(candidatesAt(board, {r: 0, c: 2})).toEqual([3]);
  })

  it('leaves the pair cells their own candidates', () => {
    const board = buildBoard({'00': [1, 2], '01': [1, 2], '02': [1, 2, 3]});

    findNakedPairs(board);

    expect(candidatesAt(board, {r: 0, c: 0})).toEqual([1, 2]);
    expect(candidatesAt(board, {r: 0, c: 1})).toEqual([1, 2]);
  })

  it('leaves the pair cells their own candidates when the pair is in a block', () => {
    // Different row and different column, so only the block branch can fire
    const board = buildBoard({'00': [1, 2], '11': [1, 2], '22': [1, 2, 3]});

    findNakedPairs(board);

    // The originating cell used to be stripped here: it was never added to the
    // exclusion list, and the list was matched against rows and columns separately
    expect(candidatesAt(board, {r: 0, c: 0})).toEqual([1, 2]);
    expect(candidatesAt(board, {r: 1, c: 1})).toEqual([1, 2]);
    expect(candidatesAt(board, {r: 2, c: 2})).toEqual([3]);
  })

  it('matches candidates as a set, whatever order the player entered them', () => {
    const board = buildBoard({'00': [1, 2], '01': [2, 1], '02': [1, 2, 3]});

    expect(findNakedPairs(board).made_changes).toBe(true);
    expect(candidatesAt(board, {r: 0, c: 2})).toEqual([3]);
  })
})

describe('naked triples', () => {
  it('eliminates the union of the three cells, not just the first cell candidates', () => {
    // Union is {1,2,3}, but the originating cell only holds {1,2}
    const board = buildBoard({'00': [1, 2], '01': [2, 3], '02': [1, 3], '03': [3, 4]});

    findNakedTriples(board);

    // 3 only goes if the union is used. Passing the originating cell notes left it behind.
    expect(candidatesAt(board, {r: 0, c: 3})).toEqual([4]);
  })

  it('leaves the three cells of the triple alone', () => {
    const board = buildBoard({'00': [1, 2], '01': [2, 3], '02': [1, 3], '03': [3, 4]});

    findNakedTriples(board);

    expect(candidatesAt(board, {r: 0, c: 0})).toEqual([1, 2]);
    expect(candidatesAt(board, {r: 0, c: 1})).toEqual([2, 3]);
    expect(candidatesAt(board, {r: 0, c: 2})).toEqual([1, 3]);
  })

  it('finds a triple inside a block', () => {
    // Spread over three rows and three columns, so only the block branch can fire
    const board = buildBoard({'00': [1, 2], '11': [2, 3], '22': [1, 3], '21': [3, 4]});

    expect(findNakedTriples(board).made_changes).toBe(true);
    expect(candidatesAt(board, {r: 2, c: 1})).toEqual([4]);
    expect(candidatesAt(board, {r: 0, c: 0})).toEqual([1, 2]);
  })
})

describe('pointing pairs', () => {
  it('clears the digit from the rest of the row outside the block', () => {
    const board = buildBoard({'00': [5, 6], '01': [5, 7], '04': [5, 8]});

    expect(findPointingPairs(board).made_changes).toBe(true);
    expect(candidatesAt(board, {r: 0, c: 4})).toEqual([8]);
  })

  it('leaves the pointing cells themselves alone', () => {
    const board = buildBoard({'00': [5, 6], '01': [5, 7], '04': [5, 8]});

    findPointingPairs(board);

    expect(candidatesAt(board, {r: 0, c: 0})).toEqual([5, 6]);
    expect(candidatesAt(board, {r: 0, c: 1})).toEqual([5, 7]);
  })
})

describe('sudokuSolver', () => {
  const holes: GridLoc[] = [
    {r: 0, c: 0}, {r: 1, c: 4}, {r: 2, c: 8}, {r: 4, c: 4}, {r: 8, c: 0},
  ];

  it('finishes a board of naked singles and reports it solved', () => {
    const result = sudokuSolver(gridWithHoles(holes));

    expect(result.status).toBe('solved');
    expect(result.emptyCells).toBe(0);
    expect(boardToString(result.board)).toBe(COMPLETE_GRID);
  })

  it('runs without a solution board', () => {
    // The whole point of making `solution` optional: grading a puzzle nobody has solved
    expect(sudokuSolver(gridWithHoles(holes), undefined).status).toBe('solved');
  })

  it('reports stuck rather than grinding through every round', () => {
    const result = sudokuSolver(blankBoard());

    expect(result.status).toBe('stuck');
    expect(result.emptyCells).toBe(81);
  })

  it('reports invalid when the board contradicts the solution', () => {
    const solution = stringToBoard(COMPLETE_GRID) as Board;
    // Blank (0,0) plus the 9 further down its column, and move a 6 into the row. That
    // leaves 9 as the only candidate for (0,0), where the solution says 6.
    const board = gridWithHoles([{r: 0, c: 0}, {r: 4, c: 0}]);
    board[0][1].digit = 6;

    expect(sudokuSolver(board, solution).status).toBe('invalid');
  })

  it('ignores the player pencil marks when working out candidates', () => {
    const board = gridWithHoles(holes);
    // A wrong mark on a cell whose only real candidate is 6
    board[0][0].notes = new Set([2, 4]);

    const result = sudokuSolver(board);

    // getAllNotes only adds, so without clearing first these would become candidates
    // and the cell would look like it had three of them
    expect(result.status).toBe('solved');
    expect(result.board[0][0].digit).toBe(6);
  })

  it('does not modify the board it is given', () => {
    const board = gridWithHoles(holes);
    const before = boardToString(board);

    sudokuSolver(board);

    expect(boardToString(board)).toBe(before);
    expect(countEmptyCells(board)).toBe(holes.length);
    // getAllNotes used to seed candidates straight onto the caller's board
    expect(board[0][0].notes.size).toBe(0);
  })

  it('hands back the player notes on cells it could not fill', () => {
    const board = blankBoard();
    board[0][0].notes = new Set([7]);

    const result = sudokuSolver(board);

    // Not the nine candidates the solver generated to work with
    expect(candidatesAt(result.board, {r: 0, c: 0})).toEqual([7]);
    expect(candidatesAt(result.board, {r: 0, c: 1})).toEqual([]);
  })

  it('clears notes on cells it filled', () => {
    const board = gridWithHoles(holes);
    board[0][0].notes = new Set([6, 9]);

    const result = sudokuSolver(board);

    expect(result.board[0][0].digit).toBe(6);
    expect(candidatesAt(result.board, {r: 0, c: 0})).toEqual([]);
  })
})
