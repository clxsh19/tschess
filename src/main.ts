import createGame from './game.js';
import drawBoard from './render/drawBoard.js';
import drawPieces from './render/drawPieces.js';
import { preloadImage } from './util.js';
import { Color } from './engine.js';

async function main(fen: string, userColor: Color) {
  const game = createGame(fen, userColor);
  const canvas = document.getElementById('chess') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // get r,c from user click
  function getUiBoardCords(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const boardX = e.clientX - rect.left - 26;
    const boardY = e.clientY - rect.top - 120;

    if (
      boardX < 0 ||
      boardY < 0 ||
      boardX >= tileWidth * 8 ||
      boardY >= tileHeight * 8
    )
      return [-1, -1];

    const col = Math.floor(boardX / tileWidth);
    const row = Math.floor(boardY / tileHeight);

    const uiBoardRow = userColor == Color.Black ? 7 - row : row;
    const uiBoardCol = userColor == Color.Black ? 7 - col : col;

    return [uiBoardRow, uiBoardCol];
  }

  // current selected piece
  let selected: { row: number; col: number } | null = null;

  // event listener for user click
  canvas.addEventListener('click', (e) => {
    const [row, col] = getUiBoardCords(e);

    console.log(row, col);
    if (game.isUserPiece(row, col)) {
      selected = { row, col };
    } else {
      if (selected) {
        //try this move
      }
    }
    console.log('selected ', selected);
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

  // async function handlePlayerTurn() {
  //   while (true) {
  //     const { fr, fc, tr, tc } = await input.getUserInput();
  //
  //     if (game.tryUserMove(fr, fc, tr, tc)) {
  //       console.log('');
  //       break;
  //     }
  //   }
  // }

  return {
    play() {
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
        getPiece: game.getPiece,
        userColor,
        piecesImage,
        pieceWidth,
        pieceHeight,
        tileWidth,
        tileHeight,
      });
      game.buildMoveMap();

      // try {
      //   while (true) {
      //     game.buildMoveMap();
      //     game.printBoard();
      //
      //     if (game.checkGameOver()) {
      //       break;
      //     }
      //
      //     if (game.isWhiteTurn) {
      //       await handlePlayerTurn();
      //     } else {
      //       game.makeComputerMove();
      //     }
      //   }
      // } finally {
      //   input.cleanup();
      // }
    },
  };
}

// const fen = 'r3k2r/pppp3p/b7/8/8/8/PPP3PP/R3K2R w KQkq - 0 1';
const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const userColor = Color.Black;
main(fen, userColor)
  .then((gameApp) => gameApp.play())
  .catch(console.error);
