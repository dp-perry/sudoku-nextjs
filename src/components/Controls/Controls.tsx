import { useContext } from 'react';
import { NotesContext } from "@/Context/NotesContext";
import { PencilIcon, ArrowUturnLeftIcon, TrashIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { DigitCount } from "@/types/types";
import Button from "@/components/Form/Button";
import DigitButton from "@/components/Controls/DigitButton";
import AssistPanel from "@/components/Controls/AssistPanel";

type ControlsType = {
  title: string
  completion: number
  errors: number
  solvedBoard: boolean
  hasActiveCell: boolean
  activeCellLocked: boolean
  canUndo: boolean
  remainingDigits: DigitCount
  hintLevel: number
  solveMessage: string
  setDigit: (digit: number) => void
  undoLastMove: () => void
  emptyCell: () => void
  solveBoard: () => void
  getAllNotes: () => void
  clearProgress: () => void
  handleStrategy: (strategy: string) => void
  debugMode: boolean
  requestHint: () => void
}

export default function Controls(
  {
    title, completion, errors, solvedBoard,
    hasActiveCell, activeCellLocked, canUndo, remainingDigits, hintLevel, solveMessage,
    setDigit, undoLastMove, emptyCell, solveBoard, getAllNotes, clearProgress,
    handleStrategy, debugMode, requestHint,
  }: ControlsType
){
  const { notesActive, setNotesActive } = useContext(NotesContext);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const iconClasses = 'size-6 md:size-7 play:size-8';

  // A cell has to be selected before anything can be written to the board. Rather
  // than swallowing the press silently, the controls that need one go disabled and
  // this line says why.
  const cellEditable = hasActiveCell && !activeCellLocked && !solvedBoard;
  const statusMessage = () => {
    // What the solver just did outranks the standing prompt, until the next move
    if (solveMessage) return solveMessage;
    if (solvedBoard) return `Solved with ${errors} ${errors === 1 ? 'error' : 'errors'}`;
    if (!hasActiveCell) return 'Select a cell to begin';
    if (activeCellLocked) return 'This cell is part of the puzzle';
    if (notesActive) return 'Notes on — tap a digit to pencil it in';
    return 'Tap a digit to fill this cell';
  }

  return(
    // Capped when stacked so the 1 and 9 keys sit well inside the bezel — on a
    // tablet held at the edge a full-width pad puts them under a resting thumb.
    <div className='w-full max-w-2xl play:max-w-none play:w-[340px] mx-auto flex flex-col gap-4'>
      {/* Puzzle status. Sits above the controls so it is beside the board in the
          side-by-side layout and above the pad when stacked. */}
      <div className='flex flex-col gap-0.5'>
        <div className='flex items-baseline justify-between gap-2'>
          <span className='font-bold text-lg'>{title}</span>
          <span className='text-sm text-zinc-500'>
            {completion}% · {errors} {errors === 1 ? 'error' : 'errors'}
          </span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-300 ${solvedBoard ? 'bg-emerald-500' : 'bg-primary'}`}
            style={{width: `${Math.min(Math.max(completion, 0), 100)}%`}}
          />
        </div>
        <div aria-live='polite' className='text-sm text-zinc-500 min-h-5'>
          {statusMessage()}
        </div>
      </div>

      {/* Mode and board-wide actions */}
      <div className='grid grid-cols-4 gap-2'>
        <Button
          variant='tool'
          density='square'
          pressed={notesActive}
          onClick={() => setNotesActive(!notesActive)}
          ariaLabel={notesActive ? 'Turn notes off' : 'Turn notes on'}
          icon={<PencilIcon className={iconClasses} />}
        >
          Notes
        </Button>

        <Button
          variant='tool'
          density='square'
          onClick={undoLastMove}
          disabled={!canUndo || solvedBoard}
          ariaLabel='Undo last move'
          icon={<ArrowUturnLeftIcon className={iconClasses} />}
        >
          Undo
        </Button>

        <Button
          variant='tool'
          density='square'
          onClick={emptyCell}
          disabled={!cellEditable}
          ariaLabel='Empty cell contents'
          icon={<TrashIcon className={iconClasses} />}
        >
          Empty
        </Button>

        <Button
          variant='tool'
          density='square'
          onClick={requestHint}
          disabled={solvedBoard}
          ariaLabel={`Get a hint, level ${hintLevel + 1} of 3`}
          icon={<LightBulbIcon className={iconClasses} />}
        >
          Hint
          {/* Pips make the three hint levels discoverable */}
          <span aria-hidden='true' className='flex gap-0.5'>
            {[0, 1, 2].map((level) => (
              <span
                key={level}
                className={`size-1 rounded-full ${level <= hintLevel ? 'bg-amber-500' : 'bg-zinc-300'}`}
              />
            ))}
          </span>
        </Button>
      </div>

      {/* Change the value of the selected cell */}
      <div className='grid grid-cols-9 gap-1.5 play:grid-cols-3 play:gap-3'>
        {digits.map((digit) =>
          <DigitButton
            key={digit}
            digit={digit}
            remaining={remainingDigits[String(digit)]}
            notesActive={notesActive}
            disabled={!cellEditable}
            onClick={() => setDigit(digit)}
          />
        )}
      </div>

      <AssistPanel
        getAllNotes={getAllNotes}
        solveBoard={solveBoard}
        clearProgress={clearProgress}
        handleStrategy={handleStrategy}
        debugMode={debugMode}
        disabled={solvedBoard}
      />
    </div>
  )
}
