'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { CellProps, Board, Puzzle } from "@/types/types";
import { stringToBoard } from "@/scripts/utils";
import { loadFromLocalStorage } from "@/scripts/persistence";

export default function PuzzlePreview({puzzle}: {puzzle: Puzzle}){
  const initialBoard = stringToBoard(puzzle.board);
  const [boardData, setBoardData] = useState<Board | {error: string}>(initialBoard);
  const [completion, setCompletion] = useState(0);

  // Stored progress is read after mount. Reading localStorage during render made the
  // server emit 0% for every puzzle while the client rendered real progress, which is
  // a guaranteed hydration mismatch.
  useEffect(() => {
    const storedBoardState = loadFromLocalStorage(puzzle.puzzle_id);
    if (storedBoardState) {
      setBoardData(storedBoardState.boardData);
      setCompletion(storedBoardState.completion);
    }
  }, [puzzle.puzzle_id]);

  if ('error' in boardData) {
    return (
      <div className='p-2 rounded-xl bg-white shadow-sm text-sm text-center'>Not a valid board</div>
    )
  }

  const getBorderClass = (cellIndex: number) => {
    if (cellIndex === 8) return '';
    return cellIndex % 3 === 2 ? 'border-r border-slate-700' : 'border-r border-slate-200';
  }

  const getCellState = (cellData: CellProps) => {
    if (cellData.state === 'locked') {
      return 'text-slate-600';
    }
    return 'text-primary';
  }

  const solved = completion >= 100;

  return (
    <Link
      href={puzzle.url}
      className='flex flex-col gap-2 p-3 rounded-xl bg-white border border-zinc-200 shadow-xs transition-[box-shadow,transform] duration-100 hover:shadow-md active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    >
      <div className='flex items-baseline justify-between gap-2'>
        <span className='font-bold text-sm'>{puzzle.name}</span>
        <span className='text-xs text-zinc-500'>{solved ? 'Solved' : `${completion}%`}</span>
      </div>

      <div className='h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden'>
        <div
          className={`h-full rounded-full transition-all duration-300 ${solved ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{width: `${Math.min(Math.max(completion, 0), 100)}%`}}
        />
      </div>

      {/* Cells flex to a ninth of the card rather than a fixed pixel size, so the
          board can never outgrow the column the grid hands it */}
      <div className='w-full border-2 border-slate-700 rounded-lg overflow-hidden'>
        {
          boardData.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`row flex ${rowIndex === 8 ? '' : rowIndex % 3 === 2 ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}
            >
              {
                row.map((cellData, cellIndex) => (
                  <div key={cellIndex} className={`
                    flex-1 aspect-square flex items-center justify-center font-bold
                    text-[11px] leading-none
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
    </Link>
  )
}
