import createGame from './game.js';
import createRender from './render/render.js';
import { rowColToSquare, mouseCordsToRowCol, decodeMove } from './util.js';
import { Color, MoveType, Piece } from './engine.js';

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

    // select a piece if own piece selected
    if (!selected?.piece) {
      if (isUserPiece) {
        selectPieceAndHighlightMoves(pieceOnClickedSq, row, col, clickedSq);
      }
      return;
    }

    const selectedSq = rowColToSquare(selected.row, selected.col);
    // get the move type user is trying
    const moveType = game.getUserMoveType(
      selectedSq,
      clickedSq,
      selected.piece,
      pieceOnClickedSq,
    );

    // same color piece selected
    if (isUserPiece) {
      // engine currently only allows castling by clicking on king then rook
      if (
        moveType === MoveType.QueenCastle ||
        moveType === MoveType.KingCastle
      ) {
        const validMove = game.validateUserMove(
          selected.row,
          selected.col,
          row,
          col,
          moveType,
        );

        if (validMove) {
          selected = null;
          executeUserMove(validMove);
          return;
        }
      }
      // no castling so select piece and highlight moves
      selectPieceAndHighlightMoves(pieceOnClickedSq, row, col, clickedSq);
    }
    // either enemy piece or empty space selected
    else {
      const validMove = game.validateUserMove(
        selected.row,
        selected.col,
        row,
        col,
        moveType,
      );
      console.log('moveType: ', moveType, 'validMove: ', validMove);
      selected = null;
      if (validMove) {
        executeUserMove(validMove);
      } else {
        render.drawBoardAndPieces();
      }
    }
  });
  function waitForPaint(): Promise<void> {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }
  async function executeUserMove(move: number) {
    const { from, to, type } = decodeMove(move);
    console.log(from, ', ', to, ', ', type);
    game.makeMove(move);
    render.drawBoardAndPieces();
    await waitForPaint();
    game.makeComputerMove();
    render.drawBoardAndPieces();
    game.buildMoveSet();
  }

  function selectPieceAndHighlightMoves(
    piece: Piece | null,
    row: number,
    col: number,
    square: number,
  ) {
    selected = { piece, row, col };
    const availableMoves = game.getMovesFromSq(square) || [];
    render.highlightMoves(selected, availableMoves);
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
