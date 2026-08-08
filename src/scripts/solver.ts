import {Board, CellProps, GridLoc} from "@/types/types";
import {countEmptyCells, deepCopy, getAllNotes, removeNotesAfterDigit, testMove} from "@/scripts/utils";

export type MoveProps = {r: number, c: number, digit: number, digits?: number[], type: string, direction: string}

/**
 * Every strategy returns the same shape.
 *
 * `made_changes` means **the board actually changed** — a digit was placed or a note was
 * deleted. It does not mean "a pattern was spotted". The difference matters: the solve
 * loop uses it to decide it is stuck, so a strategy that reports progress for finding a
 * pattern it cannot act on would keep the loop running forever.
 */
export type StrategyResult = {
  board: Board,
  made_changes: boolean,
  moves: MoveProps[],
  /** The board contradicts the supplied solution, so solving it is pointless */
  invalid?: boolean,
}

export type SolveResult = {
  board: Board,
  status: 'solved' | 'stuck' | 'invalid',
  emptyCells: number,
}

/**
 * The nine cells of the block containing (r, c), each tagged with its coordinates.
 *
 * These are shallow copies, so writing to them does not pollute the board with stray
 * fields. The `notes` Set is shared by reference on purpose: eliminations made through
 * these cells still land on the real board.
 */
const getCellsInBlock = (r: number, c: number, boardData: Board): CellProps[] => {
  const first_r = Math.floor(r / 3) * 3;
  const first_c = Math.floor(c / 3) * 3;
  const square: CellProps[] = [];

  for (let br = first_r; br < first_r + 3; br++) {
    for (let bc = first_c; bc < first_c + 3; bc++) {
      square.push({...boardData[br][bc], r: br, c: bc});
    }
  }

  return square
}

// Stand-ins for Set.prototype.isSupersetOf / .intersection, which need
// Chrome 122+ / Safari 17+ / Firefox 127+ and throw on older phone browsers.
const isSuperset = (superset: Set<number>, subset: Set<number>): boolean => {
  for (const value of subset) {
    if (!superset.has(value)) {
      return false;
    }
  }
  return true;
}

const intersect = (a: Set<number>, b: Set<number>): Set<number> => {
  const shared = new Set<number>();
  for (const value of a) {
    if (b.has(value)) {
      shared.add(value);
    }
  }
  return shared;
}

/**
 * Do two cells hold exactly the same candidates?
 *
 * Compared as sets, not as ordered arrays. The solver's own notes come from getAllNotes
 * and are always ascending, but the debug strategy buttons run over the player's board,
 * where notes are in the order they were tapped in.
 */
const sameCandidates = (a: Set<number>, b: Set<number>): boolean => {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

/**
 * Delete `digits` from the notes of every cell in the row except the excluded columns.
 * Returns whether anything was actually deleted.
 *
 * With `dryRun` it reports whether it *would* delete something without touching the
 * board — used by hint mode, so a hint is never offered for an elimination that changes
 * nothing.
 */
const removeNotesFromOthersInRow = (
  board: Board, row: number, digits: number[], excludeCols: number[], dryRun: boolean = false
): boolean => {
  let changed = false;

  for (let c = 0; c < 9; c++) {
    if (excludeCols.includes(c) || board[row][c].digit !== 0) {
      continue;
    }

    for (const digit of digits) {
      if (!board[row][c].notes.has(digit)) {
        continue;
      }
      if (dryRun) {
        return true;
      }
      board[row][c].notes.delete(digit);
      changed = true;
    }
  }

  return changed;
}

const removeNotesFromOthersInColumn = (
  board: Board, col: number, digits: number[], excludeRows: number[], dryRun: boolean = false
): boolean => {
  let changed = false;

  for (let r = 0; r < 9; r++) {
    if (excludeRows.includes(r) || board[r][col].digit !== 0) {
      continue;
    }

    for (const digit of digits) {
      if (!board[r][col].notes.has(digit)) {
        continue;
      }
      if (dryRun) {
        return true;
      }
      board[r][col].notes.delete(digit);
      changed = true;
    }
  }

  return changed;
}

/**
 * `excludeCells` holds whole coordinates. It used to be a flat number[] of [r, c] tested
 * against `cell.r` and `cell.c` independently, which excluded any cell sharing either
 * number with either coordinate — over- and under-excluding at the same time.
 */
const removeNotesFromOthersInBlock = (
  board: Board, row: number, col: number, digits: number[], excludeCells: GridLoc[], dryRun: boolean = false
): boolean => {
  let changed = false;
  const cellsInBlock = getCellsInBlock(row, col, board);

  for (const cell of cellsInBlock) {
    const excluded = excludeCells.some((exclude) => exclude.r === cell.r && exclude.c === cell.c);
    if (excluded || cell.digit !== 0) {
      continue;
    }

    for (const digit of digits) {
      if (!cell.notes.has(digit)) {
        continue;
      }
      if (dryRun) {
        return true;
      }
      cell.notes.delete(digit);
      changed = true;
    }
  }

  return changed;
}

/**
 * For any cell that has a single possible digit left fill in the cell and remove the
 * digit from its neighbours.
 * @param board
 * @param solution optional, used only to assert the fill agrees with the answer
 * @param hint return the first move instead of applying every one
 */
const fillSolvedCells = (board: Board, solution?: Board, hint: boolean = false): StrategyResult => {
  let made_changes = false;
  const moves: MoveProps[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].digit === 0 && board[r][c].notes.size === 1) {
        const newDigit = [...board[r][c].notes][0];

        if (hint) {
          return {board, made_changes: true, moves: [{r: r, c: c, digit: newDigit, type: 'solve', direction: ''}]}
        }

        // Only an assertion. Without a solution the strategy still stands on its own.
        if (solution && !testMove(solution, {r: r, c: c}, newDigit)) {
          return {board, made_changes, moves, invalid: true}
        }

        moves.push({r: r, c: c, digit: newDigit, type: 'solve', direction: ''})

        // Update the cell with the new digit
        board[r][c].digit = newDigit;
        board[r][c].notes.clear();

        // Update notes in the row, column and block to remove the digit
        board = removeNotesAfterDigit(board, {r: r, c: c}, newDigit);
        made_changes = true;
        break;
      }
    }
  }

  return {board, made_changes, moves}
}

/**
 * Find the Hidden Singles in a board, complete the cells and remove the digit from neighbours
 * @param board
 * @param solution optional, used only to assert the fill agrees with the answer
 * @param hint
 */
export const solveHiddenSingles = (board: Board, solution?: Board, hint: boolean = false): StrategyResult => {
  let made_changes = false;
  const moves: MoveProps[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {

      if (board[r][c].digit !== 0) {
        continue;
      }

      const cellNotes = board[r][c].notes;

      // For each note on a cell check the row if any other cell has it in their notes too
      for (let cellNote of cellNotes) {
        let unique_digit = true;

        // Check all the neighbour cells to check if they contain
        for (let nc = 0; nc < 9; nc++) {
          // Ignore cells with no notes and the current cell
          if (board[r][nc].digit !== 0 || nc == c) {
            continue;
          }

          // Found the digit in another cell's note then it cannot be unique
          if (board[r][nc].notes.has(cellNote)) {
            unique_digit = false;
            break;
          }
        }

        // If we found a unique digit in the notes for a row assign that digit to the current cell and move on
        if (unique_digit) {
          if (hint) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'row'}]}
          }

          if (solution && !testMove(solution, {r: r, c: c}, cellNote)) {
            return {board, made_changes, moves, invalid: true}
          }

          moves.push({r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'row'})

          board[r][c].digit = cellNote;
          board[r][c].notes.clear();
          board = removeNotesAfterDigit(board, {r: r, c: c}, cellNote);
          made_changes = true;
          break;
        }

        // Reset unique flag for column
        unique_digit = true;

        // Check columns
        for (let nr = 0; nr < 9; nr++) {
          // Skip same row or already filled cells
          if (nr == r || board[nr][c].digit !== 0) {
            continue;
          }

          if (board[nr][c].notes.has(cellNote)) {
            unique_digit = false;
            break;
          }
        }

        // If we found a unique digit in the notes for a column assign that digit to the current cell and move on
        if (unique_digit) {
          if (hint) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'column'}]}
          }

          if (solution && !testMove(solution, {r: r, c: c}, cellNote)) {
            return {board, made_changes, moves, invalid: true}
          }

          moves.push({r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'column'})

          board[r][c].digit = cellNote;
          board[r][c].notes.clear();
          board = removeNotesAfterDigit(board, {r: r, c: c}, cellNote);
          made_changes = true;
          break;
        }

        // Reset unique flag for block
        unique_digit = true;

        // Check block
        const cellsInBlock = getCellsInBlock(r, c, board);
        for (let cellInBlock of cellsInBlock) {
          if ((cellInBlock.r == r && cellInBlock.c == c) || cellInBlock.digit !== 0) {
            continue;
          }

          if (cellInBlock.notes.has(cellNote)) {
            unique_digit = false;
            break;
          }
        }

        // If we found a unique digit in the notes for a block assign that digit to the current cell and move on
        if (unique_digit) {
          if (hint) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'block'}]}
          }

          if (solution && !testMove(solution, {r: r, c: c}, cellNote)) {
            return {board, made_changes, moves, invalid: true}
          }

          moves.push({r: r, c: c, digit: cellNote, type: 'hidden_single', direction: 'block'})

          board[r][c].digit = cellNote;
          board[r][c].notes.clear();
          board = removeNotesAfterDigit(board, {r: r, c: c}, cellNote);
          made_changes = true;
          break;
        }
      }
    }
  }

  return {board, made_changes, moves}
}

/**
 * Find Naked Pairs and eliminate the digits from neighbouring notes
 * TODO: Could this handle Blind Pairs?
 * @param board
 * @param hint boolean
 */
export const findNakedPairs = (board: Board, hint: boolean = false): StrategyResult => {
  let made_changes = false;
  const moves: MoveProps[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].digit !== 0 || board[r][c].notes.size !== 2) {
        continue;
      }

      const pairNotes = board[r][c].notes;
      const pair = [...pairNotes];

      // Check row for another identical pair
      for (let cc = 0; cc < 9; cc++) {
        if (cc === c || board[r][cc].digit !== 0 || !sameCandidates(board[r][cc].notes, pairNotes)) {
          continue;
        }

        if (hint) {
          // Only worth suggesting if it would actually remove something
          if (removeNotesFromOthersInRow(board, r, pair, [c, cc], true)) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'row'}]}
          }
          break;
        }

        if (removeNotesFromOthersInRow(board, r, pair, [c, cc])) {
          moves.push({r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'row'})
          made_changes = true;
        }
        break;
      }

      // Check column for another identical pair
      for (let rr = 0; rr < 9; rr++) {
        if (rr === r || board[rr][c].digit !== 0 || !sameCandidates(board[rr][c].notes, pairNotes)) {
          continue;
        }

        if (hint) {
          if (removeNotesFromOthersInColumn(board, c, pair, [r, rr], true)) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'column'}]}
          }
          break;
        }

        if (removeNotesFromOthersInColumn(board, c, pair, [r, rr])) {
          moves.push({r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'column'})
          made_changes = true;
        }
        break;
      }

      // Check block for another identical pair
      const cellsInBlock = getCellsInBlock(r, c, board);
      for (let cellInBlock of cellsInBlock) {
        if (
          (cellInBlock.r === r && cellInBlock.c === c) ||
          cellInBlock.digit !== 0 ||
          !sameCandidates(cellInBlock.notes, pairNotes)
        ) {
          continue;
        }

        // Both cells of the pair keep their own candidates, only the rest of the block loses them
        const exclude: GridLoc[] = [{r: r, c: c}, {r: cellInBlock.r!, c: cellInBlock.c!}];

        if (hint) {
          if (removeNotesFromOthersInBlock(board, r, c, pair, exclude, true)) {
            return {board, made_changes: true, moves: [{r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'block'}]}
          }
          break;
        }

        if (removeNotesFromOthersInBlock(board, r, c, pair, exclude)) {
          moves.push({r: r, c: c, digit: 0, digits: pair, type: 'naked_pair', direction: 'block'})
          made_changes = true;
        }
        break;
      }
    }
  }

  return {board, made_changes, moves}
}

/**
 * Find Naked Triples and eliminate the digits from neighbouring notes.
 *
 * The digits eliminated are the *union* of the three cells' candidates, not the
 * originating cell's — that cell qualifies with as few as two candidates, so using its
 * notes alone leaves the third digit in place.
 *
 * TODO: Could this handle Blind Triples?
 * @param board
 */
export const findNakedTriples = (board: Board): StrategyResult => {
  let made_changes = false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      // A single-candidate cell is a naked single, fillSolvedCells' job, not a triple
      if (board[r][c].digit !== 0 || board[r][c].notes.size < 2 || board[r][c].notes.size > 3) {
        continue;
      }

      const triple = [...board[r][c].notes]

      // # Row — look for two more cells whose candidates fit inside one set of three
      const rowTripleMatches: number[] = [];
      let foundRowSet: Set<number> | undefined;
      for (let cc = 0; cc < 9; cc++) {
        // Ignore current cell, completed cell or cell with 4 or more notes
        if (cc == c || board[r][cc].digit !== 0 || board[r][cc].notes.size > 3) {
          continue
        }

        if (!foundRowSet) {
          const combinedSet = new Set([...triple, ...board[r][cc].notes])
          if (combinedSet.size == 3) {
            foundRowSet = combinedSet
            rowTripleMatches.push(cc)
          }
        } else if (isSuperset(foundRowSet, board[r][cc].notes)) {
          rowTripleMatches.push(cc)
          break;
        }
      }

      if (rowTripleMatches.length === 2 && foundRowSet) {
        if (removeNotesFromOthersInRow(board, r, [...foundRowSet], [c, ...rowTripleMatches])) {
          made_changes = true;
          break;
        }
      }

      // # Column
      const columnTripleMatches: number[] = [];
      let foundColSet: Set<number> | undefined;
      for (let rr = 0; rr < 9; rr++) {
        // Ignore cells with too many notes, these could be hidden triples though
        if (rr == r || board[rr][c].digit !== 0 || board[rr][c].notes.size > 3) {
          continue
        }

        if (!foundColSet) {
          // If no set of 3 has been found yet, try a combination of the current cells
          const combinedSet = new Set([...triple, ...board[rr][c].notes])
          // If the combined cells end up with exactly 3 unique numbers we may have found a potential triple
          if (combinedSet.size === 3) {
            foundColSet = combinedSet
            columnTripleMatches.push(rr)
          }
        } else if (isSuperset(foundColSet, board[rr][c].notes)) {
          // Current cell's notes sit inside the set, so the triple holds
          columnTripleMatches.push(rr)
          // Limit code to finding a single triple per column
          break;
        }
      }

      if (columnTripleMatches.length === 2 && foundColSet) {
        if (removeNotesFromOthersInColumn(board, c, [...foundColSet], [r, ...columnTripleMatches])) {
          made_changes = true;
          break;
        }
      }

      // # Block
      const blockTripleMatches: GridLoc[] = [];
      let foundBlockSet: Set<number> | undefined;
      const cellsInBlock = getCellsInBlock(r, c, board);
      for (let cellInBlock of cellsInBlock) {
        // Skip the originating cell, filled cells, and cells with too many candidates
        if (
          (cellInBlock.r === r && cellInBlock.c === c) ||
          cellInBlock.digit !== 0 ||
          cellInBlock.notes.size > 3
        ) {
          continue
        }

        if (!foundBlockSet) {
          const combinedSet = new Set([...triple, ...cellInBlock.notes])
          if (combinedSet.size === 3) {
            foundBlockSet = combinedSet
            blockTripleMatches.push({r: cellInBlock.r!, c: cellInBlock.c!})
          }
        } else if (isSuperset(foundBlockSet, cellInBlock.notes)) {
          blockTripleMatches.push({r: cellInBlock.r!, c: cellInBlock.c!})
          // Limit code to finding a single triple per block
          break;
        }
      }

      if (blockTripleMatches.length === 2 && foundBlockSet) {
        const exclude: GridLoc[] = [{r: r, c: c}, ...blockTripleMatches];
        if (removeNotesFromOthersInBlock(board, r, c, [...foundBlockSet], exclude)) {
          made_changes = true;
          break;
        }
      }
    }
  }

  return {board, made_changes, moves: []}
}

/**
 * A digit confined to one row or column within a block can be removed from the rest of
 * that row or column outside the block. Only removes notes, never places a digit.
 */
export const findPointingPairs = (board: Board): StrategyResult => {
  let made_changes = false;

  for (let r = 0; r < 9; r += 3) {
    for (let c = 0; c < 9; c += 3) {
      const allCellsInBlock = getCellsInBlock(r, c, board);

      // Since we're looping over these so often let only keep the relevant ones
      const cellsInBlock = allCellsInBlock.filter(cellInBlock => cellInBlock.digit === 0);

      const cellsChecked: string[] = [];

      for (let cellInBlock of cellsInBlock) {
        const cellId = cellInBlock.r + '' + cellInBlock.c;
        cellsChecked.push(cellId);

        for (const neighbourCellInBlock of cellsInBlock) {
          const ngbId = neighbourCellInBlock.r + '' + neighbourCellInBlock.c;
          // Only check cells in the same row or column
          if (
            (cellInBlock.r == neighbourCellInBlock.r && cellInBlock.c == neighbourCellInBlock.c) || // Do not check same cell
            (cellInBlock.r != neighbourCellInBlock.r && cellInBlock.c != neighbourCellInBlock.c) || // Do not check cells not in the same row / col
            cellsChecked.includes(ngbId)
          ) {
            continue;
          }

          // Get the overlapping notes of these cells
          const overlapping_notes = intersect(cellInBlock.notes, neighbourCellInBlock.notes)

          // For each overlapping note check if it appears in another column or row
          for (const overlapNote of [...overlapping_notes]) {
            for (const otherCellInBlock of cellsInBlock) {
              if (otherCellInBlock.digit !== 0) {
                continue;
              }
              // Only check for cells that are not in the same row or column
              if (
                (cellInBlock.r == neighbourCellInBlock.r && otherCellInBlock.r != neighbourCellInBlock.r) ||
                (cellInBlock.c == neighbourCellInBlock.c && otherCellInBlock.c != neighbourCellInBlock.c)
              ) {
                // If we find overlap than this digit is of no interest
                if (otherCellInBlock.notes.has(overlapNote)) {
                  overlapping_notes.delete(overlapNote)
                  break;
                }
              }
            }
          }

          if (overlapping_notes.size > 0) {
            if (cellInBlock.r === neighbourCellInBlock.r) {
              // Confined to one row of the block, so clear it from the rest of that row
              if (removeNotesFromOthersInRow(board, cellInBlock.r!, [...overlapping_notes], [c, c + 1, c + 2])) {
                made_changes = true;
              }
            } else if (cellInBlock.c === neighbourCellInBlock.c) {
              if (removeNotesFromOthersInColumn(board, cellInBlock.c!, [...overlapping_notes], [r, r + 1, r + 2])) {
                made_changes = true;
              }
            }
          }
        }

      }
    }
  }

  return {board, made_changes, moves: []}
}

/**
 * Wipe every note so the candidate set is derived purely from the digits on the board.
 *
 * `getAllNotes` only ever *adds*, so without this the player's pencil marks — including
 * wrong ones — become solver candidates and every elimination downstream inherits them.
 */
const clearAllNotes = (board: Board): Board => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      board[r][c].notes.clear();
    }
  }

  return board;
}

/**
 * Put the player's own pencil marks back. The solver generates a full candidate set to
 * work with, which is not something the player asked for — cells it filled get cleared,
 * cells it could not are handed back exactly as they were.
 */
const restorePlayerNotes = (solvedBoard: Board, originalBoard: Board): Board => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (solvedBoard[r][c].digit !== 0) {
        solvedBoard[r][c].notes.clear();
      } else {
        solvedBoard[r][c].notes = new Set(originalBoard[r][c].notes);
      }
    }
  }

  return solvedBoard;
}

/**
 * Apply the strategies in rounds until the board is finished or nothing moves.
 *
 * `solutionBoard` is optional. Without it the strategies still work — it only enables the
 * assertion that a placed digit matches the answer — which is what lets this run over a
 * generated puzzle to grade how hard it is.
 *
 * Does not modify the board it is given.
 */
export const sudokuSolver = (boardState: Board, solutionBoard?: Board): SolveResult => {
  const working = getAllNotes(clearAllNotes(deepCopy(boardState)));

  if ('error' in working) {
    return {board: boardState, status: 'invalid', emptyCells: countEmptyCells(boardState)};
  }

  const invalidResult: SolveResult = {
    board: boardState,
    status: 'invalid',
    emptyCells: countEmptyCells(boardState),
  };

  // Loop through the solving steps a max of 10 times before giving up
  for (let rounds = 0; rounds < 10; rounds++) {
    if (countEmptyCells(working) === 0) {
      break;
    }

    // Per round. Held outside the loop it could only ever be set, never cleared, so the
    // stuck check below never fired.
    let changedBoard = false;

    const solvedResult = fillSolvedCells(working, solutionBoard);
    if (solvedResult.invalid) {
      return invalidResult;
    }
    changedBoard = solvedResult.made_changes || changedBoard;

    const singlesResult = solveHiddenSingles(working, solutionBoard);
    if (singlesResult.invalid) {
      return invalidResult;
    }
    changedBoard = singlesResult.made_changes || changedBoard;

    changedBoard = findNakedPairs(working).made_changes || changedBoard;
    changedBoard = findNakedTriples(working).made_changes || changedBoard;
    changedBoard = findPointingPairs(working).made_changes || changedBoard;

    // Nothing moved this round, so no later round will move either
    if (!changedBoard) {
      break;
    }
  }

  const emptyCells = countEmptyCells(working);

  return {
    board: restorePlayerNotes(working, boardState),
    status: emptyCells === 0 ? 'solved' : 'stuck',
    emptyCells,
  };
}

/**
 * Find the easiest next move and describe it, without changing the player's board.
 * Strategies run cheapest-first so the hint matches the simplest available reasoning.
 */
export const createHint = (boardState: Board, solutionBoard?: Board): MoveProps[] | {error: string} => {
  // Derive the notes rather than trusting the player's, so a wrong pencil mark cannot
  // produce a wrong hint
  let boardWithNotes = getAllNotes(clearAllNotes(deepCopy(boardState)))

  // Oops
  if ('error' in boardWithNotes) {
    return {'error': 'Could not find a hint at this time'}
  }

  const solvedResult = fillSolvedCells(boardWithNotes, solutionBoard, true);
  if (solvedResult.made_changes) {
    return solvedResult.moves;
  }

  // Detect Hidden Singles
  const singlesResult = solveHiddenSingles(boardWithNotes, solutionBoard, true)
  if (singlesResult.made_changes) {
    return singlesResult.moves;
  }

  // Find Naked Pairs and eliminate notes
  const nakedPairResult = findNakedPairs(boardWithNotes, true)
  if (nakedPairResult.made_changes) {
    return nakedPairResult.moves;
  }

  // TODO: Naked triples and pointing pairs could be hinted too, but requestHint has no
  // wording for those move types yet.
  return {'error': 'Could not find a hint for you, make sure you have no mistakes in your board'}
}
