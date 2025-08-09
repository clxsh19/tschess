export default function drawHighlight({
  ctx,
  emptyTileImage,
  selectedSq,
  movesSq,
  tileWidth,
  tileHeight,
  getPiece,
}: {
  ctx: CanvasRenderingContext2D;
  emptyTileImage: HTMLImageElement;
  selectedSq: { row: number; col: number };
  movesSq: number[];
  tileWidth: number;
  tileHeight: number;
  getPiece: (r: number, c: number) => string;
}) {
  // highlight selected square
  const selectedSqX = selectedSq.col * tileWidth + 26;
  const selectedSqY = selectedSq.row * tileHeight + 126;
  ctx.fillStyle = 'rgb(69 77 95)';
  ctx.fillRect(selectedSqX, selectedSqY, tileWidth, tileHeight);

  // highlight selected piece moves square
  movesSq.forEach((move) => {

    const piece = getPiece(
  })
}
