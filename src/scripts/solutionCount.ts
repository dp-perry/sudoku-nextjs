import { Board } from "@/types/types";

/**
 * Brute-force solution counting, separate from the rule-based solver in solver.ts.
 * That one applies human strategies and gives up when it runs out; this one is
 * exhaustive, which is what "does this puzzle have exactly one answer" needs.
 *
 * Also the piece a puzzle generator needs: dig a hole, count, keep the hole only
 * while the count is still 1.
 */

const blockIndex = (r: number, c: number) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

const popcount = (bits: number): number => {
  let count = 0;
  while (bits) {
    bits &= bits - 1;
    count++;
  }
  return count;
}

/** Strip a Board down to plain digits, 0 for empty */
export const digitsFromBoard = (board: Board): number[][] =>
  board.map((row) => row.map((cell) => cell.digit));

/**
 * Count how many ways the grid can be completed, stopping once `limit` is reached.
 * The default of 2 answers the only question that usually matters: 0 = unsolvable,
 * 1 = a proper puzzle, 2 = ambiguous.
 *
 * Digits are tracked as bitmasks per row, column and block, and the search always
 * takes the most constrained cell first. Without that ordering a 22-clue evil board
 * is slow enough to notice.
 */
export const countSolutions = (grid: number[][], limit: number = 2): number => {
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const blocks = new Array(9).fill(0);
  const work = grid.map((row) => [...row]);

  // Seed the masks from the clues. Two clues fighting over the same digit means the
  // grid cannot be completed at all.
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const digit = work[r][c];
      if (digit === 0) {
        continue;
      }

      const bit = 1 << (digit - 1);
      const b = blockIndex(r, c);
      if ((rows[r] & bit) || (cols[c] & bit) || (blocks[b] & bit)) {
        return 0;
      }

      rows[r] |= bit;
      cols[c] |= bit;
      blocks[b] |= bit;
    }
  }

  let found = 0;

  const search = () => {
    // Pick the empty cell with the fewest candidates left
    let bestR = -1;
    let bestC = -1;
    let bestCandidates = 0;
    let bestCount = 10;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (work[r][c] !== 0) {
          continue;
        }

        const candidates = ~(rows[r] | cols[c] | blocks[blockIndex(r, c)]) & 0x1ff;
        const count = popcount(candidates);

        // A cell with nowhere to go means this branch is dead
        if (count === 0) {
          return;
        }

        if (count < bestCount) {
          bestCount = count;
          bestCandidates = candidates;
          bestR = r;
          bestC = c;
        }
      }
    }

    // No empty cells left, so the grid is complete
    if (bestR === -1) {
      found++;
      return;
    }

    const b = blockIndex(bestR, bestC);
    for (let digit = 1; digit <= 9; digit++) {
      const bit = 1 << (digit - 1);
      if (!(bestCandidates & bit)) {
        continue;
      }

      work[bestR][bestC] = digit;
      rows[bestR] |= bit;
      cols[bestC] |= bit;
      blocks[b] |= bit;

      search();

      work[bestR][bestC] = 0;
      rows[bestR] &= ~bit;
      cols[bestC] &= ~bit;
      blocks[b] &= ~bit;

      if (found >= limit) {
        return;
      }
    }
  }

  search();
  return found;
}
