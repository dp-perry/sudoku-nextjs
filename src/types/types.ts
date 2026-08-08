export type GridLoc = {
  r: number
  c: number
}

export type Puzzle = {
  puzzle_id: string
  url: string
  name: string
  notes: string
  board: string
}

export type Solution = {
  id: string
  board: string
}

type CellState = 'free' | 'locked' | 'error';
export type CellProps = {digit: number, state: CellState, notes: Set<number>, r?: number, c?: number }
export type Board = CellProps[][];

export type History = {
  gridLoc: GridLoc,
  currentState: CellProps,
  newState: CellProps
}

export type DigitCount = {
  [digit: string]: number
};