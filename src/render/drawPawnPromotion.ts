import { Color } from '../engine';

export default function drawPawnPromotionChoices({
  ctx,
  userColor,
  piecesImage,
  pieceWidth,
  pieceHeight,
  tileWidth,
  tileHeight,
}: {
  ctx: CanvasRenderingContext2D;
  userColor: Color;
  piecesImage: HTMLImageElement;
  pieceWidth: number;
  pieceHeight: number;
  tileWidth: number;
  tileHeight: number;
}) {
  // queen, rook, bishop, knight
  const pieceSx: number[] = [64, 48, 32, 16];

  pieceSx.forEach((sx, idx) => {
    const sy = userColor === Color.White ? 0 : 32;
    const dCol = idx + 2;

    ctx.drawImage(
      piecesImage,
      sx,
      sy,
      16,
      32,
      28 + dCol * tileWidth,
      tileHeight + 24 + 0 * tileHeight,
      pieceWidth,
      pieceHeight,
    );
  });
}
