import Link from "next/link";

import SudokuGame from "@/components/SudokuGame";
import {mediumBoards} from "@/lib/boards/boards";
import {mediumSolutions} from "@/lib/boards/solutions";

type Params = Promise<{ id: string }>

export default async function MediumPuzzle({ params }: { params: Params}) {
  const {id} = await params

  // Load puzzle data
  const puzzle = mediumBoards.find((board) => board.puzzle_id === id);
  // Solution
  const solution = mediumSolutions.find((solution) => solution.id === id);

  if (!puzzle || !solution) {
    return (
      'invalid puzzle'
    )
  }

  return (
    <div className='p-4'>

      <div className='w-full mb-6 text-slate-700'><Link href='/medium'>{'<-- Return to puzzle selection'}</Link></div>

      <div className="flex flex-col gap-4 max-w-fit mx-auto">
        <SudokuGame title='Sudoku - Medium' puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
