import { Color } from './engine';

function uiBoard() {
  const arrayBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ];

  function getPiece(r: number, c: number) {
    return arrayBoard[r][c];
  }

  function getPieceColor(r: number, c: number) {
    const piece = arrayBoard[r][c];
    if (piece == '.') return -1;
    return piece == piece.toUpperCase() ? Color.White : Color.Black;
  }

  function makeMove(fr: number, fc: number, tr: number, tc: number) {
    const piece = arrayBoard[fr][fc];
    arrayBoard[fr][fc] = '.';
    arrayBoard[tr][tc] = piece;
  }

  function LoadFen(fen: string) {
    // Split FEN string to get just the board part (first section)
    const fenParts = fen.split(' ');
    const boardFen = fenParts[0];
    // Split by '/' to get each rank (row)
    const ranks = boardFen.split('/');

    // Process each rank directly into the existing board
    for (let rank = 0; rank < 8; rank++) {
      const rankString = ranks[rank];
      let fileIndex = 0;

      for (let i = 0; i < rankString.length; i++) {
        const char = rankString[i];

        // If it's a digit, add that many empty squares
        if (char >= '1' && char <= '8') {
          const emptySquares = parseInt(char);
          for (let j = 0; j < emptySquares; j++) {
            arrayBoard[rank][fileIndex] = '.';
            fileIndex++;
          }
        } else {
          // It's a piece, add it directly
          arrayBoard[rank][fileIndex] = char;
          fileIndex++;
        }
      }
    }
  }

  return {
    getPiece,
    makeMove,
    LoadFen,
    getPieceColor,
  };
}

export default uiBoard;
