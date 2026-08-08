import { describe, it, expect } from 'vitest';

import { mockEasyBoard, invalidBoard } from '../mocks/mockSudokus';
import { stringToBoard } from "@/scripts/utils";

describe('stringToBoard', () => {
  it('should format a board from a valid string', () => {
    const boardData = stringToBoard(mockEasyBoard);
    /* @ts-ignore */
    expect(boardData.length).toBe(9);
    /* @ts-ignore */
    expect(boardData[0].length).toBe(9);
  });

  it('should return an error for an invalid string', () => {
    const boardData = stringToBoard(invalidBoard);
    // Functions that can fail return {error} rather than false, so callers narrow with
    // `'error' in result` — a falsy check would never fire on a truthy object
    expect('error' in boardData).toBe(true);
    expect(boardData).toEqual({error: 'Not a valid board'});
  });
})