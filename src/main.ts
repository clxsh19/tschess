import createGame from './game.js';
import createRender from './render/render.js';
import { rowColToSquare, mouseCordsToRowCol } from './util.js';
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
  let isPawnPromotion: boolean = false;
  let pendingMove: number | null = null;

  function onCanvasClick(e: MouseEvent) {
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
  }

  // broswer painted and visible to user before doing heavy work
  // like enigne search blocking the main thread.
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
    draw() {
      render.drawBoardAndPieces();
    },
    start() {
      // event listener for user click
      canvas.addEventListener('click', onCanvasClick);
      if (!game.isUserTurn) {
        game.makeComputerMove();
        render.drawBoardAndPieces();
      }
      game.buildMoveSet();
    },
    stop() {
      canvas.removeEventListener('click', onCanvasClick);
    },
  };
}

const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let gameOver = true;
let userColor = Color.Black;

const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
let mainApp = await main(defaultFen, userColor);
mainApp.draw();

startBtn.addEventListener('click', async () => {
  const fenInput = document.getElementById('fen') as HTMLInputElement;
  const colorSelect = document.getElementById(
    'colorSelect',
  ) as HTMLSelectElement;
  if (gameOver) {
    const userFen = fenInput.value.trim() || defaultFen;
    userColor = colorSelect.value === 'white' ? Color.White : Color.Black;
    gameOver = false;

    console.log('defaultFen: ', defaultFen, ' color: ', userColor);

    mainApp = await main(userFen, userColor);
    mainApp.draw();
    mainApp.start();

    startBtn.textContent = 'Surrender';
    startBtn.style.backgroundColor = '#c62828';
  } else {
    startBtn.textContent = 'Start Game';
    startBtn.style.backgroundColor = 'green';
    mainApp.stop();
    gameOver = true;
  }
});
