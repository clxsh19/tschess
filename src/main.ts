import createGame from './game.js';
import userInput from './userInput.js';

function main(fen: string | undefined) {
  const game = createGame(fen);
  const input = userInput();

  async function handlePlayerTurn() {
    while (true) {
      const { fr, fc, tr, tc } = await input.getUserInput();

      if (game.tryUserMove(fr, fc, tr, tc)) {
        console.log('');
        break;
      }
    }
  }

  return {
    async play() {
      try {
        while (true) {
          game.buildMoveMap();
          game.printBoard();

          if (game.checkGameOver()) {
            break;
          }

          if (game.isWhiteTurn) {
            await handlePlayerTurn();
          } else {
            game.makeComputerMove();
          }
        }
      } finally {
        input.cleanup();
      }
    },
  };
}

// const fen = 'r3k2r/pppp3p/b7/8/8/8/PPP3PP/R3K2R w KQkq - 0 1';
const fen = '';
main(undefined).play().catch(console.error);
