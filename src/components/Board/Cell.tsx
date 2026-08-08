import Notes from "@/components/Board/Notes";
import { CellProps } from "@/types/types";
import { memo } from "react";

export type CellType = {
  cellIndex: number,
  rowIndex: number,
  cellData: CellProps,
  highlight: string,
  selectCell: () => void
  solvedBoard: boolean,
  selected?: boolean,
}

const Cell = memo(function Cell({cellIndex, rowIndex, cellData, highlight, selectCell, solvedBoard, selected = false} : CellType) {
  // Block edges are 2px and dark, cell edges 1px and light, so the 3x3 structure
  // reads from arm's length on a tablet. The last column draws nothing, its edge is
  // the board border.
  const getBorderClass = () => {
    if (cellIndex === 8) {
      return '';
    }
    return cellIndex % 3 === 2 ? 'border-r-2 border-r-slate-700' : 'border-r border-r-slate-200';
  }

  const getCellState = () => {
      if (cellData.state === 'locked') {
        return 'text-slate-700 font-bold';
      }

      return 'text-primary font-bold';
  }

  const getBackgroundClass = () => {
    if (solvedBoard) {
      return 'bg-emerald-200';
    } else if (cellData.state === 'error') {
      return 'bg-red-500/30';
    } else if (highlight) {
      return highlight;
    }
    return 'hover:bg-slate-400/20';
  }

  const cellLabel = () => {
    const position = `Row ${rowIndex + 1}, column ${cellIndex + 1}`;
    if (cellData.digit !== 0) {
      return `${position}, ${cellData.digit}${cellData.state === 'locked' ? ', part of the puzzle' : ''}`;
    }
    if (cellData.notes.size > 0) {
      return `${position}, empty, notes ${[...cellData.notes].join(' ')}`;
    }
    return `${position}, empty`;
  }

  return (
      <button
        type='button'
        onClick={selectCell}
        aria-label={cellLabel()}
        aria-pressed={selected}
        className={`relative flex items-center justify-center transition-colors cursor-pointer
          w-[var(--cell)] h-[var(--cell)] text-[calc(var(--cell)*0.55)] leading-none
          focus-visible:outline-hidden focus-visible:z-10 focus-visible:inset-ring-2 focus-visible:inset-ring-primary
          ${selected ? 'inset-ring-2 inset-ring-indigo-500 z-10' : ''}
          ${getCellState()}
          ${getBorderClass()}
          ${getBackgroundClass()}
      `}>
          {cellData.digit !== 0 ? cellData.digit : ''}
        <Notes notes={cellData.digit === 0 ? [...cellData.notes] : []} />
      </button>
  )
})

export default Cell;
