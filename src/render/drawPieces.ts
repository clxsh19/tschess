import { Color, Piece } from '../engine.js';
import { rowColToSquare } from '../util.js';

export default function drawPieces({
  ctx,
  getPieceOnSq,
  userColor,
  piecesImage,
  pieceWidth,
  pieceHeight,
  tileWidth,
  tileHeight,
}: {
  ctx: CanvasRenderingContext2D;
  getPieceOnSq: (sq: number) => Piece | null;
  userColor: Color;
  piecesImage: HTMLImageElement;
  pieceWidth: number;
  pieceHeight: number;
  tileWidth: number;
  tileHeight: number;
}) {
  const pieceSx: number[] = [0, 16, 32, 48, 64, 80];

  const rowOrder = [...Array(8).keys()];
  const colOrder = [...Array(8).keys()];
  if (userColor == Color.Black) {
    rowOrder.reverse();
    colOrder.reverse();
  }

  const getDrawingCords =
    userColor == Color.Black
      ? (row: number, col: number) => [7 - row, 7 - col]
      : (row: number, col: number) => [row, col];

  for (const row of rowOrder) {
    for (const col of colOrder) {
      //get the piece from sqaure
      const square = rowColToSquare(row, col);
      const piece = getPieceOnSq(square);

      if (!piece) continue;

      const sy = piece.Color == Color.White ? 0 : 32;
      const sx = pieceSx[piece.Type];
      const [dRow, dCol] = getDrawingCords(row, col);

      ctx.drawImage(
        piecesImage,
        sx,
        sy,
        16,
        32,
        28 + dCol * tileWidth,
        tileHeight + 24 + dRow * tileHeight,
        pieceWidth,
        pieceHeight,
      );
    }
  }
}
