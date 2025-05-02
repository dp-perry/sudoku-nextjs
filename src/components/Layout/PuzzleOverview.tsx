import React from 'react';
import { Puzzle } from '@/types/types'
import PuzzlePreview from "@/components/Layout/PuzzlePreview";

type Props = {
  puzzles: Puzzle[],
  type: 'easy' | 'medium' | 'hard' | 'evil',
  title: string;
  description?: string
}

export default function PuzzleOverview({puzzles, type, title, description = ''}: Props) {
  return(
    <div className='p-8 flex flex-col gap-4 w-full h-full'>
      <div className={'w-full mb-2 text-slate-700'}>
        <a href={'/'}>{`<-- Return to menu`}</a>
      </div>
      <div className=''>
        <div className='text-center text-lg font-semibold'>
          {title}
        </div>
        {
          description &&
          <div className='text-center'>{description}</div>
        }
      </div>
      <div className='flex w-full flex-wrap justify-center gap-4'>
        {puzzles.map((puzzle, index) => (
          <PuzzlePreview key={index} puzzle={puzzle} />
        ))}
      </div>
    </div>
  )
}