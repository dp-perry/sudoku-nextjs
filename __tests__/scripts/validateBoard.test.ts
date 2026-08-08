import { describe, it, expect } from 'vitest';

import { mockEasyBoard, mockErrorBoard, invalidBoard } from '../mocks/mockSudokus';
import { stringToBoard, validateBoard } from "@/scripts/utils";

describe('validateBoard', () => {
  it('should return true for a valid board', () => {
    const boardData = stringToBoard(mockEasyBoard);
    /* @ts-ignore */
    expect(validateBoard(boardData)).toBe(true);
  });

  it('should return false for a board with a mistake', () => {
    const boardData = stringToBoard(mockErrorBoard);
    /* @ts-ignore */
    expect(validateBoard(boardData)).toBe(false);
  });

  it('should return false for an invalid board', () => {
    // stringToBoard rejects this string, so validateBoard is handed {error: ...} rather
    // than a grid. It has to say false, not throw part way through the row scan.
    const boardData = stringToBoard(invalidBoard);
    /* @ts-ignore */
    expect(validateBoard(boardData)).toBe(false);
  });
})