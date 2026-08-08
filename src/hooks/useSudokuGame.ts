import {useState, useCallback, useEffect, useMemo} from 'react';
import {Board, CellProps, GridLoc } from "@/types/types";
import {
  calculateCompletion,
  countEmptyCells,
  deepCopy,
  getAllNotes,
  validateBoard,
  removeNotesAfterDigit,
  testMove,
  getRemainingDigits
} from "@/scripts/utils";
import {saveToLocalStorage, loadFromLocalStorage} from "@/scripts/persistence";
import {
  findNakedPairs,
  findNakedTriples,
  findPointingPairs,
  sudokuSolver,
  solveHiddenSingles,
  createHint
} from "@/scripts/solver";

// Initialize component with empty board so the UI does not flash.
// Built fresh per hook instance: as a module-level constant it was shared by every
// puzzle and, on the server, by every request — and this board gets mutated in place.
const createEmptyBoard = (): Board => {
  const board: Board = [];
  for (let r = 0; r < 9; r++) {
    board.push([]);
    for (let c = 0; c < 9; c++) {
      board[r].push({
        digit: 0,
        state: 'locked',
        notes: new Set()
      })
    }
  }
  return board;
}

export const useSudokuGame = (puzzle_id: string, initialBoardData: Board | {error: string}, solutionBoard: Board | {error: string}) => {
  const [boardData, setBoardData] = useState<Board>(createEmptyBoard);
  const [gameHistory, setGameHistory] = useState<Board[]>([]); // Allows the user to undo moves, TODO: Store in localStorage
  const [activeCell, setActiveCell] = useState<GridLoc>({r: 9, c: 9}); // Default to a Cell of the board
  const [hintCell, setHintCell] = useState<GridLoc | undefined>(undefined)
  const [cellToValidate, setCellToValidate] = useState<GridLoc>(); // In order to give the use a chance to fix a mistake we validate cells on the next move
  const [solvedBoard, setSolvedBoard] = useState(false); // Has the board been completed, will be set on load if a completed board is in localStorage
  const [notesActive, setNotesActive] = useState(false);
  const [errors, setErrors] = useState(0); // Number of errors made, stored in localStorage
  const [completion, setCompletion] = useState(0); // Percentage of puzzle completion
  const [hintLevel, setHintLevel] = useState(0) // Hint level has 3 settings, level 0 = highlight cell, 1 = explain strategy, 3 = fill in cell
  const [hint, setHint] = useState('');
  const [solveMessage, setSolveMessage] = useState(''); // Outcome of the last "Solve the board" run

  // To calculate the progress, find the number of empty cells in the original puzzle
  const emptyCells = useMemo(() =>
    !('error' in initialBoardData) ? countEmptyCells(initialBoardData) : 0,
    [initialBoardData]
  );

  // A cell must be selected before any control does anything. These flags let the
  // Controls show that rule instead of silently swallowing the press.
  const hasActiveCell = activeCell.r !== 9;
  const activeCellLocked = hasActiveCell && boardData[activeCell.r][activeCell.c].state === 'locked';
  const canUndo = gameHistory.length > 0;

  // How many of each digit are still to be placed, used to label and retire digit buttons
  const remainingDigits = useMemo(() => getRemainingDigits(boardData), [boardData]);

  // Check one cell against the solution, flag it and count the mistake.
  // Returns the error total after the check so the caller can persist it.
  // Note the guard is `'error' in solutionBoard`: the failure case is an object,
  // which is truthy, so a plain `if (!solutionBoard)` would never fire.
  const applyValidation = (board: Board, gridLoc: GridLoc, currentErrors: number): number => {
    if ('error' in solutionBoard) {
      return currentErrors;
    }

    const cell = board[gridLoc.r][gridLoc.c];
    // An emptied cell is not a mistake
    if (cell.digit === 0) {
      return currentErrors;
    }

    if (!testMove(solutionBoard as Board, gridLoc, cell.digit)) {
      cell.state = 'error';
      return currentErrors + 1;
    }

    return currentErrors;
  }

  // Use useEffect to initialize boardData with a deep copy of initialBoardData or localStorage if available
  useEffect(() => {
    const savedBoardState = loadFromLocalStorage(puzzle_id);
    if (initialBoardData && !savedBoardState) {
      setBoardData(deepCopy(initialBoardData));
    } else if (savedBoardState) {
      setBoardData(deepCopy(savedBoardState.boardData));
      setErrors(savedBoardState.errors);
      setCompletion(savedBoardState.completion);
    }
  }, []);

  // Update the completion percentage whenever boardData changes
  useEffect(() => {
    if (initialBoardData) {
      setCompletion(calculateCompletion(emptyCells, boardData));
    }
  }, [boardData]);

  // If completion is 100% mark the board as solved no more changes can be done to the board after this
  useEffect(() => {
    if ( completion > 99 ) {
      setSolvedBoard(validateBoard(boardData));
      // Make sure we store the latest completion value in the localStorage too
      saveToLocalStorage(puzzle_id, {boardData: boardData, errors: errors, completion: 100});
    }
  }, [completion, boardData]);

  // Add a boardState to the gameHistory so that we can use the undo button, does not persist between page loads
  const addMoveToHistory = useCallback((prevBoardState: Board) => {
    const currentHistory = [...gameHistory];
    setGameHistory([...currentHistory, prevBoardState]);
  }, [gameHistory])

  // Handle updating the board state and persist it.
  // Everything written here is derived from newBoardState rather than read back from
  // state: `boardData`, `errors` and `completion` still hold the values being replaced
  // at this point, which is what used to make storage lag a move behind.
  const updateBoardData = (newBoardState: Board, newErrors: number = errors) => {
    setBoardData([...newBoardState]);

    if (newErrors !== errors) {
      setErrors(newErrors);
    }

    saveToLocalStorage(puzzle_id, {
      boardData: newBoardState,
      errors: newErrors,
      completion: calculateCompletion(emptyCells, newBoardState),
    });
  }

  // Set a Cell as active, active means its value can be changed, erased or its notes can be changed.
  // Moving to a different cell is the signal that the player is done with the previous
  // one, so that is where its grace period ends and it gets checked.
  const handleSetActiveCell = (newCell: GridLoc) => {
    if (cellToValidate && (cellToValidate.r !== newCell.r || cellToValidate.c !== newCell.c)) {
      const checkedBoard = [...boardData];
      const nextErrors = applyValidation(checkedBoard, cellToValidate, errors);
      setCellToValidate(undefined);
      updateBoardData(checkedBoard, nextErrors);
    }

    setActiveCell(newCell);
  }

  // Update a Cell state to a new digit & state and open its grace period
  const setDigit = (digit: number) => {
    let currentBoardData = [...boardData];
    addMoveToHistory(deepCopy(boardData));

    const currentCellData = currentBoardData[activeCell.r][activeCell.c];
    currentCellData.digit = (currentCellData.digit === digit) ? 0 : digit;
    currentCellData.state = 'free';

    // Update Cell data
    currentBoardData = removeNotesAfterDigit(currentBoardData, activeCell, digit);
    currentBoardData[activeCell.r][activeCell.c] = currentCellData;

    // This cell now has a grace period. It is checked against the solution when the
    // player moves to another cell, so a typo can be corrected without a penalty.
    setCellToValidate(activeCell);

    // The last solve result no longer describes this board
    setSolveMessage('');

    // Reset hints to prepare for the next Cell
    resetHintLevel()

    // Filling the last empty cell leaves nowhere to move on to, so the grace period
    // has to end here instead
    let nextErrors = errors;
    if (countEmptyCells(currentBoardData) === 0) {
      nextErrors = applyValidation(currentBoardData, activeCell, errors);
      setCellToValidate(undefined);
    }

    // Update the board
    updateBoardData(currentBoardData, nextErrors);
  }

  // Update a Cell state with a new note or remove a note
  const toggleNote = (digit: number) => {
    const currentBoardData = [...boardData];
    addMoveToHistory(deepCopy(boardData));
    const currentCellData = currentBoardData[activeCell.r][activeCell.c];

    // Add or remove the new note to the cell notes
    if (currentCellData.notes.has(digit)) {
      currentCellData.notes.delete(digit)
    } else {
      currentCellData.notes.add(digit)
    }

    // Update Cell data
    currentBoardData[activeCell.r][activeCell.c] = currentCellData;

    // Update the board
    updateBoardData(currentBoardData);
  }

  // When a digit on the Controls is clicked and a valid Cell is selected:
  // Either change the value of the cell or the notes of the cell
  // Will block is a change is not permitted
  const handleClickControlDigit = (digit: number) => {
    // If no cell is selected or the board is solved block any changes
    if (activeCell.r === 9 || solvedBoard) {
      return;
    }

    const currentCellData = boardData[activeCell.r][activeCell.c];
    // Cannot edit locked cells
    if (currentCellData.state == 'locked') {
      return;
    }

    // If notes are active change the notes on a Cell otherwise change the digit
    if (notesActive) {
      toggleNote(digit);
    } else {
      setDigit(digit);
    }
  }

  // Reset a Cell state back to empty and free, blocks on game data cells
  const handleErase = () => {
    // No cell selected means there is nothing to erase, indexing boardData[9][9] would throw
    if (!hasActiveCell || solvedBoard) {
      return;
    }

    const currentBoardData = [...boardData];
    const currentCellData = currentBoardData[activeCell.r][activeCell.c];

    // Cannot erase Game data
    if (currentCellData.state === 'locked') {
      return;
    }
    addMoveToHistory(deepCopy(boardData));

    currentCellData.digit = 0;
    currentCellData.notes.clear();
    currentCellData.state = 'free';
    currentBoardData[activeCell.r][activeCell.c] = currentCellData;

    // Update the board
    updateBoardData(currentBoardData);
  }

  // Grab the latest boardState from the history and restore boardState to this state
  // Removes the state from the game history
  const handleUndoLastMove = useCallback(() => {
    const currentHistory = [...gameHistory];
    const lastBoardState = currentHistory.pop();
    // Undo acts on the history, not on the selected cell, so it does not need one
    if (gameHistory.length === 0 || !lastBoardState || solvedBoard) {
      return;
    }

    setGameHistory([...currentHistory]);

    // The restored board may hold a different digit in the pending cell, so the
    // grace period no longer refers to anything meaningful
    setCellToValidate(undefined);

    // Update the board
    updateBoardData(lastBoardState);
  }, [gameHistory, solvedBoard])

  // Add all possible notes to each Cell
  const handleGetAllNotes = () => {
    const boardWithNotes = getAllNotes(boardData);
    if ('error' in boardWithNotes) {
      console.error('Error creating notes')
      return;
    }
    updateBoardData(boardWithNotes);
  }

  // The solver only uses the solution to assert its own moves, so an unusable one is
  // dropped rather than treated as a failure
  const solutionOrUndefined = 'error' in solutionBoard ? undefined : solutionBoard;

  // Run the Sudoku solver to attempt to complete the board, gets stuck on evil puzzles
  const handleSolveBoard = () => {
    const result = sudokuSolver(boardData, solutionOrUndefined);

    if (result.status === 'invalid') {
      setSolveMessage('There is a mistake on the board, the solver cannot continue');
      return;
    }

    setSolveMessage(
      result.status === 'solved'
        ? 'Solved the board'
        : `The solver got as far as it could, ${result.emptyCells} ${result.emptyCells === 1 ? 'cell' : 'cells'} left`
    );

    // Update the UI with the board filled in
    updateBoardData(result.board);
  }

  // Run a specific solving strategy in Debugging mode
  const handleStrategy = (strategy: string) => {
    // The strategies edit the board they are handed, so never give them React state
    const workingBoard = deepCopy(boardData);

    switch(strategy){
      case 'hidden_singles':
        updateBoardData(solveHiddenSingles(workingBoard, solutionOrUndefined).board);
        return;
      case 'naked_pairs':
        updateBoardData(findNakedPairs(workingBoard).board);
        return;
      case 'naked_triples':
        updateBoardData(findNakedTriples(workingBoard).board);
        return;
      case 'pointing_pairs':
        updateBoardData(findPointingPairs(workingBoard).board);
        return;
      default:
        return
    }
  }

  const requestHint = () => {
    const result = createHint(boardData, solutionOrUndefined)
    if ('error' in result) {
      console.error('Could not find a hint for this board')
      return;
    }
    const hintData = result[0];

    // At hint level 0 - Only indicate which cell the user should focus on
    if (hintLevel == 0) {
      setHintCell({r: hintData.r, c:hintData.c});
      setHint('')
    }
    // Hint level 1 - Give an idea of which strategy to use
    if (hintLevel == 1) {
      setHintCell({r: hintData.r, c: hintData.c});
      if (hintData.type == 'solve'){
        setHint('Only one digit is possible');
      } else if (hintData.type == 'hidden_single') {
        setHint('Only one digit is possible in this cell in this ' + hintData.direction)
      } else if (hintData.type == 'naked_pair') {
        setHint('There is a naked pair in this ' + hintData.direction)
      } else {
        console.error(`No hint available for ${hintData.type}`)
      }
    }
    // Hint level 2 - Give the actual answer for a cell and why
    if (hintLevel == 2) {
      setHintCell({r: hintData.r, c: hintData.c});
      if (hintData.type == 'solve') {
        setHint(`Only the digit ${hintData.digit} is possible`);
      } else if (hintData.type == 'hidden_single') {
        setHint(`Only the digit ${hintData.digit} is possible in this cell in this ` + hintData.direction)
      } else if (hintData.type == 'naked_pair') {
        // @ts-ignore TS fails to recognize digits here
        setHint(`There is a naked pair. Remove ${hintData.digits!.join(', ')} from cells in this block not in this ${hintData.direction}`)
      } else {
        console.error(`No hint available for ${hintData.type}`)
      }
    }
    setHintLevel(prevState =>  (prevState + 1) % 3)
  }

  const resetHintCell = () => {
    setHintCell(undefined)
    setHint('')
  }

  const resetHintLevel = () => {
    resetHintCell()
    setHintLevel(0)
  }

  return {
    boardData, setBoardData,
    activeCell,
    hasActiveCell,
    activeCellLocked,
    canUndo,
    remainingDigits,
    hintCell,
    solvedBoard,
    notesActive, setNotesActive,
    errors,
    completion,
    hintLevel,
    handleSetActiveCell,
    handleClickControlDigit,
    handleErase,
    handleUndoLastMove,
    handleGetAllNotes,
    handleSolveBoard,
    handleStrategy,
    requestHint,
    hint,
    solveMessage,
    resetHintCell,
  }
}