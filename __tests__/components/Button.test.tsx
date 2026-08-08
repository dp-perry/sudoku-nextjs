import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import DigitButton from "@/components/Controls/DigitButton";

/**
 * DigitButton renders the digit as a bare text child alongside a remaining-count badge,
 * so the button's own textContent is "digit + count". Queries go through the accessible
 * name instead, which is also what a screen reader announces.
 */
describe('DigitButton', () => {

  it('names the digit and how many are left', () => {
    render(<DigitButton digit={8} remaining={4} notesActive={false} />);

    expect(screen.getByRole('button', {name: 'Enter 8, 4 left to place'})).toBeDefined();
  })

  it('calls onClick when pressed', async () => {
    const mockOnClick = vi.fn();
    render(<DigitButton digit={3} remaining={5} notesActive={false} onClick={mockOnClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalled();
  })

  it('shows the remaining count', () => {
    render(<DigitButton digit={2} remaining={6} notesActive={false} />);

    expect(screen.getByText('6')).toBeDefined();
  })

  it('retires the digit once all nine are placed', async () => {
    const mockOnClick = vi.fn();
    render(<DigitButton digit={7} remaining={0} notesActive={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);

    await userEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  })

  it('is disabled when no cell is selected', () => {
    render(<DigitButton digit={1} remaining={9} notesActive={false} disabled={true} />);

    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  })

  it('announces note mode differently', () => {
    render(<DigitButton digit={5} remaining={2} notesActive={true} />);

    expect(screen.getByRole('button', {name: 'Toggle note 5, 2 left to place'})).toBeDefined();
  })

})
