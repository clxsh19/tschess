import createGame from './game.js';
import createRender from './render/render.js';
import { rowColToSquare, mouseCordsToRowCol } from './util.js';
import { Color, MoveType, Piece } from './engine.js';
import { off } from 'process';

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
  let isPawnPromotion: boolean = false;
  let pendingMove: number | null = null;

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

    if (isPawnPromotion && pendingMove) {
      console.log(row, col);

      if (row === 0 && col >= 2 && col <= 5) {
        const updatedMove = getUserPawnPromotionChoice(pendingMove, col);
        executeUserMove(updatedMove);
      } else {
        render.drawBoardAndPieces();
      }
      selected = null;
      isPawnPromotion = false;
      return;
    }

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
      selected = null;
      if (validMove) {
        if (
          moveType === MoveType.QueenPromotion ||
          moveType === MoveType.QueenPromotionCapture
        ) {
          render.showPawnPromotion();
          isPawnPromotion = true;
          pendingMove = validMove;
        } else {
          executeUserMove(validMove);
        }
      } else {
        render.drawBoardAndPieces();
      }
    }
  });

  // broswer painted and visible to user before doing heavy work
  // like enigne search blocking the main thread. First raf scheduled before
  // the repaint then after browser repaints it resolves. second raf happens
  // beofre the next repaint this makes sure canvas draw visible to user before
  // blocking main thread. use webworker maybe idk ...
  function waitForPaint(): Promise<void> {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }

  async function executeUserMove(move: number) {
    game.makeMove(move);
    render.drawBoardAndPieces();
    await waitForPaint();
    game.makeComputerMove();
    render.drawBoardAndPieces();
    game.buildMoveSet();
  }

  function getUserPawnPromotionChoice(pendingMove: number, choice: number) {
    const isCapture = ((pendingMove >> 12) & 0xf) > MoveType.QueenPromotion;
    const offset = choice - 2; // 2=queen, 5=knight
    const promotionType =
      (isCapture ? MoveType.QueenPromotionCapture : MoveType.QueenPromotion) -
      offset;
    // update pending move
    pendingMove = (pendingMove & 0x0fff) | (promotionType << 12);

    return pendingMove;
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

const fen = 'r3k2r/pppp3p/b7/8/8/8/PPP3PP/R3K2R w KQkq - 0 1';
// const fen = '1r2k3/P7/8/8/8/8/8/4K3 w - - 0 1';
const userColor = Color.Black;
main(fen, userColor)
  .then((gameApp) => gameApp.play())
  .catch(console.error);
