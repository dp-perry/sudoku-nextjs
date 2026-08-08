import React from "react";
import PuzzleOverview from "@/components/Layout/PuzzleOverview";
import { getDifficulty } from "@/lib/difficulties";

const Page = () => {
  const difficulty = getDifficulty('medium');
  return(
    <PuzzleOverview
      puzzles={difficulty.puzzles}
      type={difficulty.key}
      title={difficulty.listTitle}
      description={difficulty.description}
    />
  )
}

export default Page
