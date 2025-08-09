import { Color } from '../engine';

export default function drawPieces({
  ctx,
  getPiece,
  userColor,
  piecesImage,
  pieceWidth,
  pieceHeight,
  tileWidth,
  tileHeight,
}: {
  ctx: CanvasRenderingContext2D;
  getPiece: (r: number, c: number) => string;
  userColor: Color;
  piecesImage: HTMLImageElement;
  pieceWidth: number;
  pieceHeight: number;
  tileWidth: number;
  tileHeight: number;
}) {
  const pieceSx: Record<string, number> = {
    P: 0,
    N: 16,
    B: 32,
    R: 48,
    Q: 64,
    K: 80,
  };

  const rowOrder = [...Array(8).keys()];
  const colOrder = [...Array(8).keys()];
  if (userColor == Color.Black) {
    rowOrder.reverse();
    colOrder.reverse();
  }

  const getViewCords =
    userColor == Color.Black
      ? (row: number, col: number) => [7 - row, 7 - col]
      : (row: number, col: number) => [row, col];

  for (const row of rowOrder) {
    for (const col of colOrder) {
      const piece = getPiece(row, col);
      if (piece === '.') continue;

      const upperCasePiece = piece.toUpperCase();
      const isWhitePiece = piece === upperCasePiece;

      const sy = isWhitePiece ? 0 : 32;
      const sx = pieceSx[upperCasePiece];

      const [vRow, vCol] = getViewCords(row, col);

      ctx.drawImage(
        piecesImage,
        sx,
        sy,
        16,
        32,
        28 + vCol * tileWidth,
        tileHeight + 24 + vRow * tileHeight,
        pieceWidth,
        pieceHeight,
      );
    }
  }
}
