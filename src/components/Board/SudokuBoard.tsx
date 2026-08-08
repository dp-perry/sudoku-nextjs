import {useState} from "react";
import Cell from "@/components/Board/Cell";
import {Board, GridLoc} from "@/types/types";
import {memo} from "react";

type SudokuBoardTypes = {
  boardData: Board,
  solvedBoard: boolean,
  activeCell: GridLoc,
  setActiveCell: (gridLoc: GridLoc) => void;
  hintCell: GridLoc | undefined;
  resetHintCell: () => void;
  debugMode: boolean
}

const SudokuBoard = memo(function SudokuBoard({boardData, solvedBoard, activeCell, setActiveCell, hintCell, resetHintCell, debugMode}: SudokuBoardTypes) {
  const squares = [[0,1,2], [3,4,5], [6,7,8]];
  const [activeSquare, setActiveSquare] = useState({rows: [9,9,9], columns: [9,9,9]});

  const handleSelectCell = (gridLoc: GridLoc) => {
    resetHintCell()
    setActiveCell(gridLoc);
    setActiveSquare({
      rows: inSquare(gridLoc.r),
      columns: inSquare(gridLoc.c)
    });
  }

  const inSquare = (digit: number) => {
    let currentSquare: number[] = [];
    for (let square of squares) {
      if (square.indexOf(digit) !== -1) {
        currentSquare = square;
        break;
      }
    }
    return currentSquare;
  }

  // The digit sitting in the selected cell, so every copy of it can be picked out
  const activeDigit = activeCell.r !== 9 ? boardData[activeCell.r][activeCell.c].digit : 0;

  const highlightCell = (gridLoc: GridLoc) => {
    if (hintCell) {
      if (hintCell.r == gridLoc.r && hintCell.c == gridLoc.c) {
        return 'bg-amber-200/70'
      }
    }
    // Highlight as selected cell
    if (gridLoc.r == activeCell.r && gridLoc.c == activeCell.c) {
      return 'bg-indigo-200/70';
    }

    // Every other cell holding the same digit as the selected one
    if (activeDigit !== 0 && boardData[gridLoc.r][gridLoc.c].digit === activeDigit) {
      return 'bg-indigo-200/40';
    }

    // Highlight as row, col or block cell
    if (gridLoc.r == activeCell.r) {
      return 'bg-sky-200/30';
    }
    if (gridLoc.c == activeCell.c) {
      return 'bg-sky-200/30';
    }

    if (activeSquare.rows.indexOf(gridLoc.r) > -1 && activeSquare.columns.indexOf(gridLoc.c) > -1) {
      return 'bg-sky-200/30';
    }

    return '';
  }

  return (
    <div className='sudoku-board border-2 border-slate-700 w-fit m-auto rounded-2xl overflow-hidden shadow-md bg-white'>
      {debugMode && <div className='flex divide-x divide-slate-300 border-b-2 border-b-gray-600 bg-gray-100'>
        <div className='w-[45px] border-r-2 border-r-gray-600'> </div>
        <div className='flex-1 py-2 text-center'>0</div>
        <div className='flex-1 py-2 text-center'>1</div>
        <div className='flex-1 py-2 text-center'>2</div>
        <div className='flex-1 py-2 text-center'>3</div>
        <div className='flex-1 py-2 text-center'>4</div>
        <div className='flex-1 py-2 text-center'>5</div>
        <div className='flex-1 py-2 text-center'>6</div>
        <div className='flex-1 py-2 text-center'>7</div>
        <div className='flex-1 py-2 text-center'>8</div>
      </div>}
      {
        boardData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`row flex ${rowIndex === 8 ? '' : rowIndex % 3 === 2 ? 'border-b-2 border-b-slate-700' : 'border-b border-b-slate-200'}`}
          >
            {debugMode && <div className='flex-1 flex flex-col items-center justify-center w-[45px] border-r-2 border-r-gray-600 bg-gray-100'>{rowIndex}</div>}
            {
              row.map((cellData, cellIndex) => (
                <Cell
                  key={`${rowIndex}-${cellIndex}`}
                  cellIndex={cellIndex}
                  rowIndex={rowIndex}
                  cellData={boardData[rowIndex][cellIndex]}
                  selectCell={() => handleSelectCell({r: rowIndex, c: cellIndex})}
                  highlight={highlightCell({r: rowIndex, c: cellIndex})}
                  selected={rowIndex === activeCell.r && cellIndex === activeCell.c}
                  solvedBoard={solvedBoard}
                />
              ))
            }
          </div>
        ))
      }
    </div>
  )
})

export default SudokuBoard;
