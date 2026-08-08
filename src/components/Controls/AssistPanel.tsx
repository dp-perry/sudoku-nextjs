'use client'

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Form/Button";
import ConfirmDialog from "@/components/Overlay/ConfirmDialog";

type AssistPanelProps = {
  getAllNotes: () => void,
  solveBoard: () => void,
  clearProgress: () => void,
  handleStrategy: (strategy: string) => void,
  debugMode: boolean,
  disabled?: boolean,
}

const strategies = [
  {key: 'hidden_singles', label: 'Solve Hidden Singles'},
  {key: 'naked_pairs', label: 'Naked Pairs'},
  {key: 'naked_triples', label: 'Naked Triples'},
  {key: 'pointing_pairs', label: 'Pointing Pairs'},
]

/**
 * Assist and reset actions, collapsed by default. These used to sit full width
 * directly under the digit pad, where a mis-aimed tap could solve or wipe the
 * puzzle. The two irreversible ones now ask first.
 */
export default function AssistPanel(
  {getAllNotes, solveBoard, clearProgress, handleStrategy, debugMode, disabled = false}: AssistPanelProps
) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<'solve' | 'clear' | null>(null);

  return (
    <div className='border-t border-zinc-200 pt-3'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className='flex items-center justify-center gap-1 w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 rounded-lg cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary'
      >
        Assist
        <ChevronDownIcon className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        <div className='flex flex-col gap-2 pt-2'>
          <Button variant='secondary' density='touch' onClick={getAllNotes} disabled={disabled}>
            Fill in notes
          </Button>
          <Button variant='secondary' density='touch' onClick={() => setConfirming('solve')} disabled={disabled}>
            Solve the board
          </Button>
          <Button variant='danger_soft' density='touch' onClick={() => setConfirming('clear')}>
            Clear puzzle progress
          </Button>

          {debugMode &&
            <div className='flex flex-col gap-2 pt-2 border-t border-zinc-200'>
              <b className='text-sm'>Run strategies</b>
              {strategies.map((strategy) => (
                <Button
                  key={strategy.key}
                  variant='outline'
                  density='comfortable'
                  onClick={() => handleStrategy(strategy.key)}
                >
                  {strategy.label}
                </Button>
              ))}
            </div>
          }
        </div>
      }

      {confirming === 'solve' &&
        <ConfirmDialog
          title='Solve the board?'
          description='The solver fills in the rest of the puzzle. This ends the game and cannot be undone.'
          confirmLabel='Solve it'
          onConfirm={() => { setConfirming(null); solveBoard(); }}
          onCancel={() => setConfirming(null)}
        />
      }

      {confirming === 'clear' &&
        <ConfirmDialog
          title='Clear puzzle progress?'
          description='Every digit and note you entered for this puzzle is removed and the board returns to its starting position.'
          confirmLabel='Clear progress'
          onConfirm={() => { setConfirming(null); clearProgress(); }}
          onCancel={() => setConfirming(null)}
        />
      }
    </div>
  )
}
