import { preloadImage } from '../util.js';
import drawBoard from './drawBoard.js';
import drawPieces from './drawPieces.js';
import drawHighlight from './drawHighlight.js';
import drawPawnPromotion from './drawPawnPromotion.js';
import { Piece, Color } from '../engine.js';

interface RenderItemParams {
  canvas: HTMLCanvasElement;
  userColor: Color;
  getPieceOnSq: (sq: number) => Piece | null;
  tileSize: [number, number];
}

async function createRender({
  canvas,
  userColor,
  getPieceOnSq,
  tileSize,
}: RenderItemParams) {
  const [tileWidth, tileHeight] = tileSize;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // piece size
  const pieceWidth = 48;
  const pieceHeight = 96;

  // preload images
  const [tileImage, ranksImage, piecesImage, emptyTileImage] =
    await Promise.all([
      preloadImage('../assets/tiles.png'),
      preloadImage('../assets/ranks.png'),
      preloadImage('../assets/pieces.png'),
      preloadImage('../assets/empty2.png'),
    ]);

  function drawBoardAndPieces() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard({
      ctx,
      userColor,
      tileImage,
      ranksImage,
      tileWidth,
      tileHeight,
    });

    drawPieces({
      ctx,
      getPieceOnSq,
      userColor,
      piecesImage,
      pieceWidth,
      pieceHeight,
      tileWidth,
      tileHeight,
    });
  }

  function highlightMoves(
    selected: { row: number; col: number },
    selectedMoves: number[],
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard({
      ctx,
      userColor,
      tileImage,
      ranksImage,
      tileWidth,
      tileHeight,
    });
    drawHighlight({
      ctx,
      emptyTileImage,
      userColor,
      selected,
      selectedMoves,
      tileWidth,
      tileHeight,
      getPieceOnSq,
    });
    drawPieces({
      ctx,
      getPieceOnSq,
      userColor,
      piecesImage,
      pieceWidth,
      pieceHeight,
      tileWidth,
      tileHeight,
    });
  }

  function showPawnPromotion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard({
      ctx,
      userColor,
      tileImage,
      ranksImage,
      tileWidth,
      tileHeight,
    });
    drawPawnPromotion({
      ctx,
      userColor,
      piecesImage,
      pieceWidth,
      pieceHeight,
      tileWidth,
      tileHeight,
    });
  }

  return {
    drawBoardAndPieces,
    highlightMoves,
    showPawnPromotion,
  };
}

export default createRender;
