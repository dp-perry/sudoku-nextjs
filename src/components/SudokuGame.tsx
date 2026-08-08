'use client';
import React from "react";
import { deepCopy, stringToBoard } from "@/scripts/utils";
import { Puzzle, Solution } from "@/types/types";
import { useSudokuGame } from '@/hooks/useSudokuGame';
import { clearPuzzleProgress } from "@/scripts/persistence";

import SudokuBoard from "@/components/Board/SudokuBoard";
import Controls from "@/components/Controls/Controls";
import { NotesContext } from "@/Context/NotesContext";

type SudokuGame = {
  title: string,
  puzzle: Puzzle,
  solution: Solution,
}

export default function SudokuGame({ title, puzzle, solution }: SudokuGame){
  const debugMode = false;
  const initialBoardData = stringToBoard(puzzle.board);
  const solutionBoard = stringToBoard(solution.board);

  const {
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
    resetHintCell
  } = useSudokuGame(
    puzzle.puzzle_id, initialBoardData, solutionBoard
  )

  const handleClearPuzzleProgress = () => {
    clearPuzzleProgress(puzzle.puzzle_id);
    if (!('error' in initialBoardData)) {
      setBoardData(deepCopy(initialBoardData));
    }
  }

  if ('error' in initialBoardData || 'error' in solutionBoard) {
    return (
      <div>
        An error occurred while trying to load the puzzle
      </div>
    )
  }

  return (
    <NotesContext.Provider value={{ notesActive, setNotesActive }}>
      {/* Stacked on phone and portrait tablet, board beside the controls in landscape */}
      <div className='flex-1 flex flex-col play:flex-row play:items-start justify-center gap-6 play:gap-10 w-full'>
        <div className='flex flex-col gap-3 items-center'>
          <SudokuBoard
            boardData={boardData}
            activeCell={activeCell}
            hintCell={hintCell}
            resetHintCell={resetHintCell}
            setActiveCell={(gridLoc) => handleSetActiveCell(gridLoc)}
            solvedBoard={solvedBoard}
            debugMode={debugMode}
          />

          {hint &&
            <div className='bg-white rounded-xl px-3 py-2 max-w-full mx-auto shadow-sm text-sm text-center'>
              {hint}
            </div>
          }
        </div>

        <Controls
          title={title}
          completion={completion}
          errors={errors}
          solvedBoard={solvedBoard}
          hasActiveCell={hasActiveCell}
          activeCellLocked={activeCellLocked}
          canUndo={canUndo}
          remainingDigits={remainingDigits}
          hintLevel={hintLevel}
          solveMessage={solveMessage}
          setDigit={(digit) => handleClickControlDigit(digit)}
          emptyCell={() => handleErase()}
          undoLastMove={() => handleUndoLastMove()}
          solveBoard={() => handleSolveBoard()}
          getAllNotes={() => handleGetAllNotes()}
          clearProgress={() => handleClearPuzzleProgress()}
          handleStrategy={handleStrategy}
          debugMode={debugMode}
          requestHint={requestHint}
        />
      </div>
    </NotesContext.Provider>
  )
}
