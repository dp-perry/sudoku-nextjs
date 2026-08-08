import { describe, it, expect, vi } from 'vitest'
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import Controls from "@/components/Controls/Controls";
import { DigitCount } from "@/types/types";

const allRemaining: DigitCount = {
  '1': 9, '2': 9, '3': 9, '4': 9, '5': 9, '6': 9, '7': 9, '8': 9, '9': 9,
};

/** Defaults describe a live puzzle with a selected, editable cell */
const renderControls = (overrides: Partial<ComponentProps<typeof Controls>> = {}) => {
  const props = {
    title: 'Easy 1',
    completion: 0,
    errors: 0,
    solvedBoard: false,
    hasActiveCell: true,
    activeCellLocked: false,
    canUndo: true,
    remainingDigits: allRemaining,
    hintLevel: 0,
    solveMessage: '',
    setDigit: vi.fn(),
    undoLastMove: vi.fn(),
    emptyCell: vi.fn(),
    solveBoard: vi.fn(),
    getAllNotes: vi.fn(),
    clearProgress: vi.fn(),
    handleStrategy: vi.fn(),
    debugMode: false,
    requestHint: vi.fn(),
    ...overrides,
  };

  render(<Controls {...props} />);
  return props;
}

describe('Controls', () => {

  it('should render all buttons', () => {
    renderControls();

    for (let i = 1; i < 10; i++) {
      expect(screen.getByRole('button', {name: `Enter ${i}, 9 left to place`})).toBeDefined();
    }

    expect(screen.getByText('Notes')).toBeDefined()
    expect(screen.getByText('Undo')).toBeDefined()
    expect(screen.getByText('Empty')).toBeDefined()
    expect(screen.getByText('Hint')).toBeDefined()
  });

  it('should undo last move', async () => {
    const {undoLastMove} = renderControls();

    await userEvent.click(screen.getByRole('button', {name: 'Undo last move'}));

    expect(undoLastMove).toHaveBeenCalled();
  });

  it('should empty cell', async () => {
    const {emptyCell} = renderControls();

    await userEvent.click(screen.getByRole('button', {name: 'Empty cell contents'}));

    expect(emptyCell).toHaveBeenCalled();
  });

  it('should set a digit', async () => {
    const {setDigit} = renderControls();

    await userEvent.click(screen.getByRole('button', {name: 'Enter 4, 9 left to place'}));

    expect(setDigit).toHaveBeenCalledWith(4);
  });

  // The rule the UI exists to make visible: nothing writes to the board until a cell
  // has been chosen
  describe('with no cell selected', () => {
    it('prompts the player to pick one', () => {
      renderControls({hasActiveCell: false});

      expect(screen.getByText('Select a cell to begin')).toBeDefined();
    });

    it('disables the digits and Empty, but not Undo', async () => {
      const {setDigit, emptyCell, undoLastMove} = renderControls({hasActiveCell: false});

      await userEvent.click(screen.getByRole('button', {name: 'Enter 1, 9 left to place'}));
      await userEvent.click(screen.getByRole('button', {name: 'Empty cell contents'}));
      await userEvent.click(screen.getByRole('button', {name: 'Undo last move'}));

      expect(setDigit).not.toHaveBeenCalled();
      expect(emptyCell).not.toHaveBeenCalled();
      // Undo acts on the history, not on a cell
      expect(undoLastMove).toHaveBeenCalled();
    });
  });

  it('explains why a clue cannot be edited', () => {
    renderControls({activeCellLocked: true});

    expect(screen.getByText('This cell is part of the puzzle')).toBeDefined();
  });

  it('reports what the solver did', () => {
    renderControls({solveMessage: 'Solved the board'});

    expect(screen.getByText('Solved the board')).toBeDefined();
  });

})
