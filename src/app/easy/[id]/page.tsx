import Link from "next/link";

import SudokuGame from "@/components/SudokuGame";
import { easyBoards } from "@/lib/boards/boards";
import { easySolutions } from "@/lib/boards/solutions";


type Params = Promise<{ id: string }>

export default async function EasyPuzzle({ params }: { params: Params}) {
  const {id} = await params
  // Load puzzle data
  const puzzle = easyBoards.find((board) => board.puzzle_id === id);
  // Solution
  const solution = easySolutions.find((solution) => solution.id === id);

  if (!puzzle || !solution) {
    return (
      'invalid puzzle'
    )
  }

  return (
    <div className='h-full flex flex-col p-4'>

      <div className='w-full mb-6 text-slate-700'><Link href='/easy'>{'<-- Return to puzzle selection'}</Link></div>

      <div className="flex-1 flex flex-col gap-4 mx-auto">
        <SudokuGame title='Sudoku - Easy' puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
