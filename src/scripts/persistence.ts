import {Board} from "@/types/types";

export const loadFromLocalStorage = (puzzle_id: string): {boardData: Board, errors: number, completion: number} | false => {
  if (typeof localStorage === "undefined") {
    console.error('Unable to use localStorage')
    return false;
  }

  const storageObj = localStorage.getItem(puzzle_id);
  if (!storageObj) {
    return false;
  }

  let puzzleData;
  try {
    puzzleData = JSON.parse(storageObj);
  } catch {
    console.error(`Could not read stored progress for ${puzzle_id}`);
    return false;
  }

  if (!puzzleData?.boardData) {
    return false;
  }

  const processed_puzzle: {digit: number; state: string; notes: Set<unknown>; r: number; c: number;}[][] = [];
  for (let r = 0; r < 9; r++) {
    processed_puzzle[r] = []
    for (let c = 0; c < 9; c++) {
      processed_puzzle[r].push(
        {
          digit: puzzleData.boardData[r][c].digit,
          state: puzzleData.boardData[r][c].state,
          notes: new Set(puzzleData.boardData[r][c].notes),
          r: r,
          c: c
        }
      )
    }
  }

  puzzleData.boardData = processed_puzzle;

  return puzzleData;
}

export const saveToLocalStorage = (puzzle_id: string, puzzleData: {boardData: Board, errors: number, completion: number}) => {
  if (typeof localStorage === "undefined") {
    console.error('Unable to use localStorage')
    return false;
  }

  // Translate the notes from a Set to an array for json storage
  const processed_puzzle: { digit: number; state: string; notes: number[]; r: number; c: number; }[][] = [];
  for (let r = 0; r < 9; r++) {
    processed_puzzle[r] = []
    for (let c = 0; c < 9; c++) {
      processed_puzzle[r].push(
        {
          digit: puzzleData.boardData[r][c].digit,
          state: puzzleData.boardData[r][c].state,
          notes: [...puzzleData.boardData[r][c].notes],
          r: r,
          c: c
        }
      )
    }
  }

  const storageData = {
    boardData: processed_puzzle,
    errors: puzzleData.errors,
    completion: puzzleData.completion
  }

  localStorage.setItem(puzzle_id, JSON.stringify(storageData));
  return true;
}

// Read only the stored completion percentage. The menu needs this for every puzzle
// at once, and rebuilding 81 cells per puzzle just to read one number is wasteful.
export const getStoredCompletion = (puzzle_id: string): number => {
  if (typeof localStorage === "undefined") {
    return 0;
  }

  const storageObj = localStorage.getItem(puzzle_id);
  if (!storageObj) {
    return 0;
  }

  try {
    const puzzleData = JSON.parse(storageObj);
    return typeof puzzleData?.completion === 'number' ? puzzleData.completion : 0;
  } catch {
    return 0;
  }
}

export const clearPuzzleProgress = (puzzle_id: string) => {
  if (typeof localStorage === "undefined") {
    console.error('Unable to clear item')
    return false;
  }

  localStorage.removeItem(puzzle_id);
}

export const clearAppData = () => {
  if (typeof localStorage === "undefined") {
    console.error('Unable to clear localStorage')
    return false;
  }

  localStorage.clear()
}