import { squareToRowCol } from '../util.js';
import { Color } from '../engine';

export default function drawHighlight({
  ctx,
  userColor,
  emptyTileImage,
  selected,
  selectedMoves,
  tileWidth,
  tileHeight,
  getPiece,
  isUserPiece,
}: {
  ctx: CanvasRenderingContext2D;
  userColor: Color;
  emptyTileImage: HTMLImageElement;
  selected: { row: number; col: number };
  selectedMoves: number[];
  tileWidth: number;
  tileHeight: number;
  getPiece: (r: number, c: number) => string;
  isUserPiece: (r: number, c: number) => boolean;
}) {
  let selectedRow = selected.row;
  let selectedCol = selected.col;

  if (userColor == Color.Black) {
    selectedCol = 7 - selectedCol;
    selectedRow = 7 - selectedRow;
  }

  // highlight selected square
  let selectedSqX = selectedCol * tileWidth + 26;
  let selectedSqY = selectedRow * tileHeight + 120;

  // rgb(69 77 95)
  ctx.fillStyle = 'rgb(155, 165, 180)';
  ctx.fillRect(selectedSqX, selectedSqY, tileWidth, tileHeight);

  // highlight selected piece moves square
  selectedMoves.forEach((move) => {
    let [moveRow, moveCol] = squareToRowCol(move);
    // Uiboard and engine both have white at bottom and black at the top.
    // The selected move is flipped if player color is black and we get
    // moves for the square selected by the player from move map generated
    // using engine. get the piece at moveRow, moveCol
    const piece = getPiece(moveRow, moveCol);
    const userPiece = isUserPiece(moveRow, moveCol);

    // if player color is black, we need to flip the row,col for drawing
    // flipped board
    if (userColor == Color.Black) {
      moveRow = 7 - moveRow;
      moveCol = 7 - moveCol;
    }

    // if a quite move, draw the move indicator sprite
    if (piece == '.') {
      ctx.drawImage(
        emptyTileImage,
        0,
        0,
        22,
        15,
        14 + 26 + moveCol * tileWidth,
        12 + 120 + moveRow * tileHeight,
        22,
        15,
      );
    } else {
      ctx.strokeStyle = 'red';
      if (userPiece) ctx.strokeStyle = 'cyan';

      ctx.lineWidth = 4;
      ctx.strokeRect(
        28 + moveCol * tileWidth,
        122 + moveRow * tileHeight,
        tileWidth - 3,
        tileHeight - 3,
      );
    }
  });
}
