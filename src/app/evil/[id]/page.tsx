import Link from "next/link";

import SudokuGame from "@/components/SudokuGame";
import { evilBoards } from "@/lib/boards/boards";
import { evilSolutions } from "@/lib/boards/solutions";

type Params = Promise<{ id: string }>

export default async function EasyPuzzle({ params }: { params: Params}) {
  const {id} = await params;

  // Load puzzle data
  const puzzle = evilBoards.find((board) => board.puzzle_id === id);
  // Solution
  const solution = evilSolutions.find((solution) => solution.id === id);

  if (!puzzle || !solution) {
    return (
      'invalid puzzle'
    )
  }

  return (
    <div className='p-4'>

      <div className='w-full mb-6 text-slate-700'><Link href='/evil'>{'<-- Return to puzzle selection'}</Link></div>

      <div className="flex flex-col gap-4 max-w-fit mx-auto">
        <SudokuGame title='Sudoku - Evil' puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
