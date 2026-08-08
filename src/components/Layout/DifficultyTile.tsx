'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { DifficultyInfo } from "@/lib/difficulties";
import { getStoredCompletion } from "@/scripts/persistence";

/**
 * One difficulty on the menu. Progress is read after mount, never during render —
 * the server has no localStorage, so reading it during render guarantees a
 * hydration mismatch.
 */
export default function DifficultyTile({difficulty}: {difficulty: DifficultyInfo}) {
  const [started, setStarted] = useState<number | null>(null);
  const [finished, setFinished] = useState(0);

  useEffect(() => {
    let inProgress = 0;
    let complete = 0;
    for (const puzzle of difficulty.puzzles) {
      const completion = getStoredCompletion(puzzle.puzzle_id);
      if (completion >= 100) {
        complete++;
      } else if (completion > 0) {
        inProgress++;
      }
    }
    setStarted(inProgress);
    setFinished(complete);
  }, [difficulty]);

  const progressLabel = () => {
    if (started === null) return ' ';
    if (finished === 0 && started === 0) return `${difficulty.puzzles.length} puzzles`;
    if (started === 0) return `${finished} of ${difficulty.puzzles.length} solved`;
    return `${finished} solved · ${started} in progress`;
  }

  return (
    <Link
      href={difficulty.href}
      className='group flex items-center gap-4 w-full min-h-touch p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs transition-[box-shadow,transform] duration-100 hover:shadow-md active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    >
      <div className='flex-1 flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-lg text-zinc-900'>{difficulty.title}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficulty.accent}`}>
            {difficulty.key}
          </span>
        </div>
        <span className='text-sm text-zinc-500'>{difficulty.description}</span>
        <span className='text-sm font-medium text-zinc-400'>{progressLabel()}</span>
      </div>
      <ChevronRightIcon className='size-5 text-zinc-400 shrink-0' />
    </Link>
  )
}
