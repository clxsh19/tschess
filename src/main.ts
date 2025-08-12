import createGame from './game.js';
import drawBoard from './render/drawBoard.js';
import drawPieces from './render/drawPieces.js';
import drawHighlight from './render/drawHighlight.js';
import { preloadImage, rowColToSquare, mouseCordsToRowCol } from './util.js';
import { Color } from './engine.js';

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
        getPiece: game.getPiece,
        isUserPiece: game.isUserPiece,
      });
    }
    drawPieces({
      ctx,
      getPiece: game.getPiece,
      userColor,
      piecesImage,
      pieceWidth,
      pieceHeight,
      tileWidth,
      tileHeight,
    });
  }

  // current selected piece
  let selected: { row: number; col: number } | null = null;

  // event listener for user click
  canvas.addEventListener('click', (e) => {
    if (!game.isUserTurn) return;

    const rect = canvas.getBoundingClientRect();
    // get r,c from user click
    const [row, col] = mouseCordsToRowCol(
      e,
      rect,
      tileWidth,
      tileHeight,
      userColor,
    );

    // out of bound click
    if (row == -1 || col == -1) return;

    const isOwnPiece = game.isUserPiece(row, col);

    if (!selected) {
      if (isOwnPiece) {
        selected = { row, col };
        const selectedSq = rowColToSquare(selected.row, selected.col);
        const selectedMoves = game.getMovesFromSq(selectedSq) || [];
        renderChessBoard(selected, selectedMoves);
      }
      return;
    }

    // same color piece selected
    if (isOwnPiece) {
      // engine currently only allows castling by clicking on king then rook
      const selectedPiece = game.getPiece(selected.row, selected.col);
      const pieceAt = game.getPiece(row, col);
      const isCastlingAttempt =
        (selectedPiece == 'K' && pieceAt == 'R') ||
        (selectedPiece == 'k' && pieceAt == 'r');

      if (isCastlingAttempt) {
        // try castling
        const moved = game.tryUserMove(selected.row, selected.col, row, col);
        selected = null;
        renderChessBoard();

        if (moved) {
          game.printBoard();
          game.makeComputerMove();
          renderChessBoard();
          game.buildMoveSet();
        }
      } else {
        selected = { row, col };
        const selectedSq = rowColToSquare(selected.row, selected.col);
        const selectedMoves = game.getMovesFromSq(selectedSq) || [];
        renderChessBoard(selected, selectedMoves);
      }
    }
    // either enemy piece or empty space selected
    else {
      if (selected) {
        //try this move
        const moved = game.tryUserMove(selected.row, selected.col, row, col);
        selected = null;
        renderChessBoard();

        if (moved) {
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
