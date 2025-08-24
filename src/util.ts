import { MoveType, Color, Piece, PieceType } from './engine';

export function decodeMove(move: number) {
  const from = (move >> 6) & 63;
  const to = move & 63;
  const type = (move >>> 12) & 0xf;
  return {
    from: squareToRowCol(from),
    to: squareToRowCol(to),
    type,
  };
}

export function encodeMove(
  fr: number,
  fc: number,
  tr: number,
  tc: number,
  type: MoveType,
) {
  const fromSquare = rowColToSquare(fr, fc) & 63;
  const toSqaure = rowColToSquare(tr, tc) & 63;
  return ((type & 63) << 12) | (fromSquare << 6) | toSqaure;
}

export function squareToRowCol(square: number) {
  const row = Math.floor(square / 8); // 0 = top (rank 8)
  const col = square % 8; // 0 = a, 7 = h
  return [row, col]; // matches UI grid
}

export function rowColToSquare(row: number, col: number) {
  return row * 8 + col;
}

export async function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function mouseCordsToRowCol(
  e: MouseEvent,
  rect: DOMRect,
  tileWidth: number,
  tileHeight: number,
  userColor: Color,
) {
  const boardX = e.clientX - rect.left - 26;
  const boardY = e.clientY - rect.top - 120;

  if (
    boardX < 0 ||
    boardY < 0 ||
    boardX >= tileWidth * 8 ||
    boardY >= tileHeight * 8
  )
    return [-1, -1];

  const col = Math.floor(boardX / tileWidth);
  const row = Math.floor(boardY / tileHeight);

  const uiBoardRow = userColor == Color.Black ? 7 - row : row;
  const uiBoardCol = userColor == Color.Black ? 7 - col : col;

  return [uiBoardRow, uiBoardCol];
}

export function moveToNotation({
  move,
  getPieceOnSq,
}: {
  move: number;
  getPieceOnSq: (sq: number) => Piece | null;
}): string {
  const fromSq = move & 0x3f; // lower 6 bits = from
  const toSq = (move >> 6) & 0x3f; // next 6 bits = to
  const moveType = (move >> 12) & 0xf;

  // --- Castling ---
  if (moveType === MoveType.KingCastle) return 'O-O';
  if (moveType === MoveType.QueenCastle) return 'O-O-O';

  const piece = getPieceOnSq(fromSq);
  if (!piece) return '';

  // --- Square conversion helper ---
  const squareToAlgebraic = (sq: number): string => {
    const [row, col] = squareToRowCol(sq);
    const files = 'abcdefgh';
    const ranks = '87654321'; // row 0 = rank 8, row 7 = rank 1
    return files[col] + ranks[row];
  };

  const fromNotation = squareToAlgebraic(fromSq);
  const toNotation = squareToAlgebraic(toSq);

  // --- Piece icons ---
  // ♟ (pawn), ♞ (knight), ♝ (bishop), ♜ (rook), ♛ (queen), ♚
  // ♙ (pawn),  (knight), ♗ (bishop),  (rook),  (queen),  (king)
  const pieceIcons = ['', '♘', '♗', '♖', '♕', '♔'];
  const pieceIcon = pieceIcons[piece.Type] || '';

  // --- Check for captures ---
  const isCapture =
    moveType === MoveType.Capture ||
    moveType === MoveType.EPCapture ||
    moveType === MoveType.KnightPromotionCapture ||
    moveType === MoveType.BishopPromotionCapture ||
    moveType === MoveType.RookPromotionCapture ||
    moveType === MoveType.QueenPromotionCapture;

  let result = '';

  // --- Pawns ---
  if (piece.Type === PieceType.Pawn) {
    if (isCapture) {
      // For pawn captures, show file of departure: exd5
      result = fromNotation[0] + 'x' + toNotation;
    } else {
      // For regular pawn moves: e4
      result = toNotation;
    }

    // Add promotion
    if (
      moveType >= MoveType.KnightPromotion &&
      moveType <= MoveType.QueenPromotionCapture
    ) {
      const promotionIcons = ['♞', '♗', '♜', '♛']; // Knight=8, Bishop=9, Rook=10, Queen=11
      const promoIndex =
        moveType >= MoveType.KnightPromotionCapture
          ? moveType - MoveType.KnightPromotionCapture // 12-15 -> 0-3
          : moveType - MoveType.KnightPromotion; // 8-11 -> 0-3

      if (promoIndex >= 0 && promoIndex < promotionIcons.length) {
        result += '=' + promotionIcons[promoIndex];
      }
    }
  }
  // --- Other pieces ---
  else {
    const captureMark = isCapture ? 'x' : '';
    result = pieceIcon + fromNotation + captureMark + toNotation;
  }

  return result;
}
