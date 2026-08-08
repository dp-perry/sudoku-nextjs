import {GridLoc, DigitCount, Board, CellProps} from "@/types/types";

export const deepCopy = (object: any) => {
  return structuredClone(object);
}

/* Convert a board string to a board Array */
export const stringToBoard = (boardString: string): {error: string} | Board => {
    if (boardString.replaceAll(' ', '').length !== 81) {
        return {'error': 'Not a valid board'};
    }
    // @ts-ignore
    return boardString
      .split(' ')
      .map((row) => [...row].map(
        (digit) => (
          {
              digit: parseInt(digit),
              state: (parseInt(digit) == 0 ? 'free' : 'locked'),
              notes: new Set()
          }
        )
      ));
}

/* Convert a board Array back to the space separated string format used in lib/boards */
export const boardToString = (board: Board): string => {
    let board_sequence = '';
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            board_sequence += board[r][c].digit;
            if ((r * board[r].length + c + 1) % 9 === 0) {
                board_sequence += ' ';
            }
        }
    }
    return board_sequence.trim();
}

// Test if a group is completely filled, 1 to 9
const validateGroup = (group: number[]) => {
    group = group.filter((n) => n != 0);
    return group.length === new Set(group).size;
}

// Return all digits in the same block as the given row and column are in
const getDigitsInBlock = (r: number, c: number, boardData: Board) => {
    const first_r = Math.floor(r / 3) * 3;
    const first_c = Math.floor(c / 3) * 3;
    const square = [];

    // Check square
    for (let r = first_r; r < first_r + 3; r++) {
        for (let c = first_c; c < first_c + 3; c++) {
            square.push(boardData[r][c].digit);
        }
    }

    return square
}

// Test a move with the actual solution
export const testMove = (solutionBoard: Board, cellToTest: GridLoc, digit: number) => {
    // Only return error if an incorrect digit was given, ignore 0
    if (
      solutionBoard[cellToTest.r][cellToTest.c].digit !== digit &&
      solutionBoard[cellToTest.r][cellToTest.c].digit != 0
    ) {
        return false;
    }

    return true;
}

// Checks the validity of the move against currently visible digits
// Increases the difficulty level slightly as only obvious mistakes are caught
export const validateMove = (boardData: Board, gridLoc: GridLoc) => {
    // Test row
    if (!validateGroup(boardData[gridLoc.r].map((c) => c.digit))) {
        return false;
    }

    const column = boardData.map((row) => row[gridLoc.c]);
    if (!validateGroup(column.map((c) => c.digit))) {
        return false;
    }

    const block = getDigitsInBlock(gridLoc.r, gridLoc.c, boardData);
    return validateGroup(block);
}

// Validate the entire board, does not test against the solution it only checks for double digits
export const validateBoard = (boardData: Board) => {
    // Test board validity. stringToBoard hands back {error: ...} for a malformed string,
    // and callers do not always narrow it, so anything that is not a 9-row grid fails here
    // rather than throwing part way through.
    if (!boardData || !Array.isArray(boardData) || boardData.length !== 9) {
        console.error('Invalid board');
        return false;
    }

    // Check rows
    for (let row of boardData) {
        if (!validateGroup(row.map((c) => c.digit))) {
            return false;
        }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
        const column = boardData.map((row) => row[col]);
        if (!validateGroup(column.map((c) => c.digit))) {
            return false;
        }
    }

    // Check squares
    for (let r = 0; r < 9; r += 3) {
        for (let c = 0; c < 9; c += 3) {
            const block = getDigitsInBlock(r, c, boardData);

            if (!validateGroup(block)) {
                return false;
            }
        }
    }

    return true;
}

// Fill in all the notes on a board
export const getAllNotes = (boardData: Board) => {
    if (!boardData) {
        console.error('Invalid board');
        return {'error': 'Invalid board'};
    }

    // Check squares
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            // Create a set from the row
            const blockedDigits = new Set(boardData[r].map((c) => c.digit));

            // Handle the column
            const column = boardData.map((row) => row[c]);
            const digits_in_column = column.map((c) => c.digit);
            for (let digit_in_column of digits_in_column) {
                blockedDigits.add(digit_in_column);
            }

            // Handle the block
            const block = getDigitsInBlock(r, c, boardData);
            for (let digit_in_block of block) {
                blockedDigits.add(digit_in_block);
            }

            for (let digit = 1; digit < 10; digit++) {
                if (!blockedDigits.has(digit)) {
                    boardData[r][c].notes.add(digit)
                }
            }
        }
    }

    return boardData;
}

// Calculate how many of each digit still need to be entered.
// A complete grid holds exactly 9 of every digit, so remaining = 9 - placed.
export const getRemainingDigits = (boardData: Board): DigitCount => {
    const digits: DigitCount = {
        '1': 9,
        '2': 9,
        '3': 9,
        '4': 9,
        '5': 9,
        '6': 9,
        '7': 9,
        '8': 9,
        '9': 9,
    };

    if (!boardData) {
        console.error('Invalid board');
        return digits;
    }

    for (let row of boardData) {
        for (let cell of row) {
            // Skip empty cells, they carry digit 0
            if (cell.digit >= 1 && cell.digit <= 9) {
                digits[String(cell.digit)] = digits[String(cell.digit)] - 1;
            }
        }
    }

    return digits;
}

// Count the number of unfilled Cells, used in the completion function
export const countEmptyCells = (board: Board | false) => {
  if (!board) {
    return 9*9;
  }

  let empty_cells = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell.digit == 0) {
        empty_cells++;
      }
    }
  }
  return empty_cells;
}

// How much of the puzzle has been solved
export const calculateCompletion = (intialEmptyCells: number,boardData: Board) => {
    let current_empty_cells = countEmptyCells(boardData);

    return 100 - Math.floor((current_empty_cells * 100) / intialEmptyCells);
}

// When a digit is placed in a Cell remove all notes of the given digit from Cells 0n:
// the same row, same column and in the same square
export const removeNotesAfterDigit = (currentBoardData: CellProps[][], activeCell: GridLoc, digit: number) => {
    // remove digit out of row
    for (let c = 0; c < currentBoardData[activeCell.r].length; c++) {
        currentBoardData[activeCell.r][c].notes.delete(digit)
    }
    // Remove digit out of column
    for (let r = 0; r < currentBoardData.length; r++) {
        currentBoardData[r][activeCell.c].notes.delete(digit)
    }

    // Remove notes out of the square
    const first_r = Math.floor(activeCell.r / 3) * 3;
    const first_c = Math.floor(activeCell.c / 3) * 3;
    for (let r = first_r; r < first_r + 3; r++) {
        for (let c = first_c; c < first_c + 3; c++) {
            currentBoardData[r][c].notes.delete(digit)
        }
    }

    return currentBoardData;
}
