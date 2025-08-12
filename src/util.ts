import { MoveType, Color } from './engine';

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
