let Chess;
try {
  const chessModule = require('chess.js');
  Chess = chessModule.Chess || chessModule;
} catch (e) {
  Chess = null;
}

class ChessEngine {
  constructor() {
    this.games = new Map();
  }

  createGame(roomId) {
    let game;
    if (Chess) {
      game = new Chess();
    } else {
      // Fallback board representation
      game = {
        fen: () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: () => 'w',
        isGameOver: () => false,
        isCheck: () => false,
        isCheckmate: () => false,
        isDraw: () => false,
        move: (m) => m,
        history: () => [],
      };
    }
    this.games.set(roomId, game);
    return this.getState(roomId);
  }

  makeMove(roomId, moveData) {
    const game = this.games.get(roomId) || this.createGame(roomId);
    try {
      let result;
      if (typeof game.move === 'function') {
        result = game.move(moveData);
      }
      return {
        success: !!result,
        move: result,
        state: this.getState(roomId),
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        state: this.getState(roomId),
      };
    }
  }

  getState(roomId) {
    const game = this.games.get(roomId);
    if (!game) return null;

    return {
      fen: typeof game.fen === 'function' ? game.fen() : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: typeof game.turn === 'function' ? game.turn() : 'w',
      isGameOver: typeof game.isGameOver === 'function' ? game.isGameOver() : false,
      isCheck: typeof game.inCheck === 'function' ? game.inCheck() : (typeof game.isCheck === 'function' ? game.isCheck() : false),
      isCheckmate: typeof game.isCheckmate === 'function' ? game.isCheckmate() : false,
      isDraw: typeof game.isDraw === 'function' ? game.isDraw() : false,
      history: typeof game.history === 'function' ? game.history() : [],
    };
  }

  resetGame(roomId) {
    if (Chess) {
      this.games.set(roomId, new Chess());
    }
    return this.getState(roomId);
  }
}

const chessEngine = new ChessEngine();
module.exports = chessEngine;
