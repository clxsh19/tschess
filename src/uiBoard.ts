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

  const pieceUnicode: Record<string, string> = {
    P: '♙',
    N: '♘',
    B: '♗',
    R: '♖',
    Q: '♕',
    K: '♔',
    p: '♟︎',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚',
    '.': '.',
  };

  function getPiece(r: number, c: number) {
    return arrayBoard[r][c];
  }

  function getPieceColor(r: number, c: number) {
    const piece = arrayBoard[r][c];
    if (piece == '.') return -1;
    return piece == piece.toUpperCase() ? Color.White : Color.Black;
  }

  function printBoard() {
    for (let row = 0; row < 8; row++) {
      const rank = 8 - row;
      const rowStr = arrayBoard[row]
        .map((cell) => pieceUnicode[cell] || cell)
        .join(' ');
      console.log(`${row}  ${rowStr}`);
    }
    console.log('   0 1 2 3 4 5 6 7');
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
    printBoard,
    getPiece,
    makeMove,
    LoadFen,
    getPieceColor,
  };
}

export default uiBoard;
