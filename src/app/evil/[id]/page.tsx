import SudokuGame from "@/components/SudokuGame";
import BackLink from "@/components/Elements/BackLink";
import { evilBoards } from "@/lib/boards/boards";
import { evilSolutions } from "@/lib/boards/solutions";

type Params = Promise<{ id: string }>

export default async function EvilPuzzle({ params }: { params: Params}) {
  const {id} = await params
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
    <div className='h-full flex flex-col p-2 md:p-6 gap-2'>
      <BackLink href='/evil'>Evil puzzles</BackLink>

      <div className="flex-1 flex flex-col w-full">
        <SudokuGame title={puzzle.name} puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
