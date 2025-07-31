import { Color } from '../engine';

export default function drawBoard({
  ctx,
  userColor,
  tileImage,
  ranksImage,
  tileWidth,
  tileHeight,
}: {
  ctx: CanvasRenderingContext2D;
  userColor: Color;
  tileImage: HTMLImageElement;
  ranksImage: HTMLImageElement;
  tileWidth: number;
  tileHeight: number;
}) {
  // fill behind the board
  ctx.fillStyle = 'rgb(69 77 95)';
  ctx.fillRect(0, 100, 468, 360);

  // border around the board
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 118, 420, 324);

  // board footer
  ctx.fillStyle = 'rgb(48 48 64)';
  ctx.fillRect(0, 460, 468, 14);

  // start drawing from this x and y or offset
  const offsetX = 26;
  const offsetY = 120;

  // each alphabet or number in rank image is of size 5X16
  for (let col = 0; col < 8; col++) {
    const viewCol = userColor == Color.Black ? 7 - col : col;

    // numbers for rank
    ctx.drawImage(
      ranksImage,
      col * 6,
      0,
      5,
      16,
      12,
      offsetY + tileHeight / 4 + viewCol * tileHeight,
      5,
      16,
    );

    // alphabets for file
    ctx.drawImage(
      ranksImage,
      48 + col * 6,
      0,
      5,
      16,
      offsetX + tileWidth / 4 + viewCol * tileWidth + 4,
      436,
      6,
      18,
    );

    let isWhite = col % 2 === 0;
    // tiles for board
    for (let row = 0; row < 8; row++) {
      const sx = isWhite ? 0 : 64;
      const dx = offsetX + col * tileWidth;
      const dy = offsetY + row * tileHeight;
      // a single tile is of size 64X48
      ctx.drawImage(tileImage, sx, 0, 64, 48, dx, dy, tileWidth, tileHeight);
      isWhite = !isWhite;
    }

    // ctx.strokeStyle = 'cyan';
    // ctx.lineWidth = 2;
    // ctx.strokeRect(1, 1, 466, 472);
  }
}
