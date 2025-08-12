import createGame from './game.js';
import drawBoard from './render/drawBoard.js';
import drawPieces from './render/drawPieces.js';
import drawHighlight from './render/drawHighlight.js';
import { preloadImage, rowColToSquare, mouseCordsToRowCol } from './util.js';
import { Color, Piece, PieceType } from './engine.js';

async function main(fen: string, userColor: Color) {
  const game = createGame(fen, userColor);
  const canvas = document.getElementById('chess') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  function renderChessBoard(
    selected?: { row: number; col: number },
    selectedMoves?: number[],
  ) {
    drawBoard({
      ctx,
      userColor,
      tileImage,
      ranksImage,
      tileWidth,
      tileHeight,
    });
    if (selected && selectedMoves && selectedMoves.length > 0) {
      drawHighlight({
        ctx,
        emptyTileImage,
        userColor,
        selected,
        selectedMoves,
        tileWidth,
        tileHeight,
        getPieceOnSq: game.getPieceOnSq,
      });
    }
    drawPieces({
      ctx,
      getPieceOnSq: game.getPieceOnSq,
      userColor,
      piecesImage,
      pieceWidth,
      pieceHeight,
      tileWidth,
      tileHeight,
    });
  }

  // current selected piece
  let selected: { piece: Piece | null; row: number; col: number } | null = null;

  // event listener for user click
  canvas.addEventListener('click', (e) => {
    if (!game.isUserTurn) return;

    const rect = canvas.getBoundingClientRect();
    // get r,c from user click. flipped if user color is black
    const [row, col] = mouseCordsToRowCol(
      e,
      rect,
      tileWidth,
      tileHeight,
      userColor,
    );

    // out of bound click
    if (row == -1 || col == -1) return;

    const clickedSq = rowColToSquare(row, col);
    const pieceOnClickedSq = game.getPieceOnSq(clickedSq);
    const isUserPiece = pieceOnClickedSq
      ? pieceOnClickedSq.Color == userColor
      : false;

    // assign selected piece to clicked piece if user piece
    if (!selected || !selected.piece) {
      if (isUserPiece) {
        selected = { piece: pieceOnClickedSq, row, col };
        const clickedSqMoves = game.getMovesFromSq(clickedSq) || [];
        renderChessBoard(selected, clickedSqMoves);
      }
      return;
    }

    // same color piece selected
    if (isUserPiece) {
      // engine currently only allows castling by clicking on king then rook
      const isCastlingAttempt =
        pieceOnClickedSq &&
        selected.piece.Type == PieceType.King &&
        pieceOnClickedSq.Type == PieceType.Rook;

      // try castling
      if (isCastlingAttempt) {
        const moveSuccess = game.tryUserMove(
          selected.row,
          selected.col,
          row,
          col,
        );
        selected = null;
        renderChessBoard();

        if (moveSuccess) {
          game.makeComputerMove();
          renderChessBoard();
          game.buildMoveSet();
        }
      } else {
        selected = { piece: pieceOnClickedSq, row, col };
        const clickedSqMoves = game.getMovesFromSq(clickedSq) || [];
        renderChessBoard(selected, clickedSqMoves);
      }
    }
    // either enemy piece or empty space selected
    else {
      if (selected) {
        //try this move
        const moveSuccess = game.tryUserMove(
          selected.row,
          selected.col,
          row,
          col,
        );
        selected = null;
        renderChessBoard();

        if (moveSuccess) {
          game.makeComputerMove();
          renderChessBoard();
          game.buildMoveSet();
        }
      }
    }
  });

  // tile size
  const tileWidth = 52;
  const tileHeight = 40;
  // piece size
  const pieceWidth = 48;
  const pieceHeight = 96;

  // preload assets
  const tileImage = await preloadImage('../assets/tiles.png');
  const ranksImage = await preloadImage('../assets/ranks.png');
  const piecesImage = await preloadImage('../assets/pieces.png');
  const emptyTileImage = await preloadImage('../assets/empty2.png');

  return {
    play() {
      renderChessBoard();
      game.buildMoveSet();
    },
  };
}

// const fen = 'r3k2r/pppp3p/b7/8/8/8/PPP3PP/R3K2R w KQkq - 0 1';
const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1';
const userColor = Color.Black;
main(fen, userColor)
  .then((gameApp) => gameApp.play())
  .catch(console.error);
