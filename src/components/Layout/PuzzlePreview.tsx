'use client'

import {CellProps, Puzzle} from "@/types/types";
import {stringToBoard} from "@/scripts/utils";
import { loadFromLocalStorage } from "@/scripts/persistence";

export default function PuzzlePreview({puzzle}: {puzzle: Puzzle}){
  const storedBoardState = loadFromLocalStorage(puzzle.puzzle_id);
  const boardData =  (storedBoardState ) ? storedBoardState.boardData : stringToBoard(puzzle.board);
  const completion = (storedBoardState) ? storedBoardState.completion : 0;
  if('error' in boardData){
    return (
      <div>Not a valid board</div>
    )
  }

  const getBorderClass = (cellIndex: number) => {
    return cellIndex % 3 === 2 && cellIndex !== 8 ? 'border-r border-slate-800' : 'border-r border-slate-300';
  }

  const getCellState = (cellData: CellProps) => {
    if (cellData.state === 'locked') {
      return 'text-slate-600 font-bold';
    }
    return 'text-blue-700 font-bold';
  }

  return (
    <a href={puzzle.url} className='cursor-pointer shadow p-2 rounded-xl bg-white'>
      <div className='text-center font-bold'>{puzzle.name}</div>
      <div className='text-center text-sm mb-2'>Complete: {completion}%</div>
      <div>
        <div className='border-2 border-slate-700 transition-colors bg-white hover:bg-sky-50 rounded-lg overflow-hidden'>
          {
            boardData.map((row, rowIndex) => (
              <div key={rowIndex}
                   className={`row flex ${rowIndex % 3 === 2 && rowIndex != 8 ? 'border-slate-800 border-b' : 'border-slate-300 border-b'}`}>
                {
                  row.map((cellData, cellIndex) => (
                    <div key={cellIndex} className={`
                      relative flex items-center justify-center w-[20px] h-[20px] text-sm transition-colors text-blue-700 font-bold
                      ${getBorderClass(cellIndex)}
                      ${getCellState(cellData)}
                      `}>
                      {cellData.digit !== 0 ? cellData.digit : ''}
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
    </a>
  )
}