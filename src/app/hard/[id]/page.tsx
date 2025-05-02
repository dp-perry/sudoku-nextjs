import Link from "next/link";

import SudokuGame from "@/components/SudokuGame";
import {hardBoards} from "@/lib/boards/boards";
import {hardSolutions} from "@/lib/boards/solutions";

type Params = Promise<{ id: string }>

export default async function HardPuzzle({ params }: { params: Params}) {
  const {id} = await params

  // Load puzzle data
  const puzzle = hardBoards.find((board) => board.puzzle_id === id);
  // Solution
  const solution = hardSolutions.find((solution) => solution.id === id);

  if (!puzzle || !solution) {
    return (
      'invalid puzzle'
    )
  }

  return (
    <div className='p-4'>

      <div className='w-full mb-6 text-slate-700'><Link href='/hard'>{'<-- Return to puzzle selection'}</Link></div>

      <div className="flex flex-col gap-4 max-w-fit mx-auto">
        <SudokuGame title='Sudoku - Hard' puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
