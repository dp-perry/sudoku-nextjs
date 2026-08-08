import React from 'react';
import { Puzzle } from '@/types/types'
import PuzzlePreview from "@/components/Layout/PuzzlePreview";
import BackLink from "@/components/Elements/BackLink";

type Props = {
  puzzles: Puzzle[],
  type: 'easy' | 'medium' | 'hard' | 'evil',
  title: string;
  description?: string
}

export default function PuzzleOverview({puzzles, type, title, description = ''}: Props) {
  return(
    <div className='p-4 md:p-8 flex flex-col gap-4 w-full h-full'>
      <BackLink href='/'>Menu</BackLink>

      <div>
        <div className='text-center text-lg font-semibold'>
          {title}
        </div>
        {
          description &&
          <div className='text-center text-zinc-500'>{description}</div>
        }
      </div>

      {/* A grid keeps the preview cards in columns instead of reflowing raggedly */}
      <div className='grid gap-3 md:gap-4 justify-center grid-cols-[repeat(auto-fill,minmax(190px,1fr))] max-w-5xl w-full mx-auto'>
        {puzzles.map((puzzle, index) => (
          <PuzzlePreview key={index} puzzle={puzzle} />
        ))}
      </div>
    </div>
  )
}
