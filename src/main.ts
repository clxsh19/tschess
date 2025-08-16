import createGame from './game.js';
import createRender from './render/render.js';
import { rowColToSquare, mouseCordsToRowCol } from './util.js';
import { Color, Piece, PieceType } from './engine.js';

async function main(fen: string, userColor: Color) {
  // tile size
  const tileWidth = 52;
  const tileHeight = 40;

  const game = createGame(fen, userColor);
  const canvas = document.getElementById('chess') as HTMLCanvasElement;
  const render = await createRender({
    tileSize: [tileWidth, tileHeight],
    userColor,
    canvas,
    getPieceOnSq: game.getPieceOnSq,
  });

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
    if (row === -1 || col === -1) return;

    const clickedSq = rowColToSquare(row, col);
    const pieceOnClickedSq = game.getPieceOnSq(clickedSq);
    const isUserPiece = pieceOnClickedSq
      ? pieceOnClickedSq.Color === userColor
      : false;

    // no piece selected so clicked piece if it's user piece
    if (!selected?.piece) {
      if (isUserPiece) {
        selectPieceAndRedraw(pieceOnClickedSq, row, col, clickedSq);
      }
      return;
    }

    // same color piece selected
    if (isUserPiece) {
      // engine currently only allows castling by clicking on king then rook
      const isCastlingAttempt =
        pieceOnClickedSq &&
        selected.piece.Type === PieceType.King &&
        pieceOnClickedSq.Type === PieceType.Rook;

      // try castling
      if (isCastlingAttempt) {
        const moveSuccess = game.tryUserMove(
          selected.row,
          selected.col,
          row,
          col,
        );

        if (moveSuccess) {
          selected = null;
          render.drawBoardAndPieces();
          game.makeComputerMove();
          render.drawBoardAndPieces();
          game.buildMoveSet();
          return;
        }
      }
      // change the piece and redraw board
      selectPieceAndRedraw(pieceOnClickedSq, row, col, clickedSq);
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
        render.drawBoardAndPieces();

        if (moveSuccess) {
          game.makeComputerMove();
          render.drawBoardAndPieces();
          game.buildMoveSet();
        }
      }
    }
  });

  function selectPieceAndRedraw(
    piece: Piece | null,
    row: number,
    col: number,
    square: number,
  ) {
    selected = { piece, row, col };
    const availableMoves = game.getMovesFromSq(square) || [];
    render.drawBoardAndPieces(selected, availableMoves);
  }

  return {
    play() {
      render.drawBoardAndPieces();
      if (!game.isUserTurn) {
        game.makeComputerMove();
        render.drawBoardAndPieces();
      }
      game.buildMoveSet();
    },
  };
}

// const fen = 'r3k2r/pppp3p/b7/8/8/8/PPP3PP/R3K2R w KQkq - 0 1';
const fen = '8/P7/8/8/8/8/8/K6k w - - 0 1';
const userColor = Color.White;
main(fen, userColor)
  .then((gameApp) => gameApp.play())
  .catch(console.error);
