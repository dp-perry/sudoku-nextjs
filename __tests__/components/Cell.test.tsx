import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import Cell from "@/components/Board/Cell";

const renderCell = (cellData: {digit: number, state: 'free' | 'locked' | 'error', notes: number[]}, selectCell = () => {}) =>
  render(
    <Cell
      cellIndex={2}
      rowIndex={0}
      cellData={{...cellData, notes: new Set(cellData.notes)}}
      highlight=''
      selectCell={selectCell}
      solvedBoard={false}
    />
  );

describe('Cell', () => {

	it('should not show any digit if its 0', () => {
    renderCell({digit: 0, state: 'free', notes: []});

    for (let i = 1; i < 10; i++) {
			expect(screen.queryByText(String(i))).toBeNull();
		}
	})

  it('should show given digit', () => {
    renderCell({digit: 8, state: 'free', notes: []});

    expect(screen.getByText('8')).toBeDefined();

    for (const notShown of ['2', '5', '9']) {
      expect(screen.queryByText(notShown)).toBeNull();
    }
  })

  it('should display all notes', () => {
    renderCell({digit: 0, state: 'free', notes: [1, 2, 3, 4, 5, 6, 7, 8, 9]});

    for (let i = 1; i < 10; i++) {
      expect(screen.getByText(String(i))).toBeDefined();
    }
  })

	it('should not display notes if it has a digit', () => {
    renderCell({digit: 9, state: 'free', notes: [1, 2, 3, 4, 5, 6, 7, 8]});

		expect(screen.getByText('9')).toBeDefined()

    for (let i = 1; i < 9; i++) {
      expect(screen.queryByText(String(i))).toBeNull();
    }
  })

  it('is a button that reports its position and contents', () => {
    renderCell({digit: 4, state: 'locked', notes: []});

    // rowIndex 0 / cellIndex 2 are zero-based, the label is not
    expect(screen.getByRole('button', {name: 'Row 1, column 3, 4, part of the puzzle'})).toBeDefined();
  })

  it('selects the cell when pressed', async () => {
    const mockSelectCell = vi.fn();
    renderCell({digit: 0, state: 'free', notes: []}, mockSelectCell);

    await userEvent.click(screen.getByRole('button'));

    expect(mockSelectCell).toHaveBeenCalled();
  })
})
