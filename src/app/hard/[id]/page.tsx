import SudokuGame from "@/components/SudokuGame";
import BackLink from "@/components/Elements/BackLink";
import { hardBoards } from "@/lib/boards/boards";
import { hardSolutions } from "@/lib/boards/solutions";

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
    <div className='h-full flex flex-col p-2 md:p-6 gap-2'>
      <BackLink href='/hard'>Hard puzzles</BackLink>

      <div className="flex-1 flex flex-col w-full">
        <SudokuGame title={puzzle.name} puzzle={puzzle} solution={solution} />
      </div>
    </div>
  )
}
