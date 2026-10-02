class TicTacToeEngine {
  constructor() {
    this.games = new Map();
  }

  createGame(roomId) {
    const state = {
      board: Array(9).fill(null),
      currentTurn: 'X',
      winner: null,
      isDraw: false,
      winningLine: null,
      movesCount: 0,
    };
    this.games.set(roomId, state);
    return state;
  }

  makeMove(roomId, { index, playerSymbol }) {
    const game = this.games.get(roomId) || this.createGame(roomId);

    if (game.winner || game.isDraw) {
      return { success: false, error: 'Game is already finished', state: game };
    }

    if (index < 0 || index > 8 || game.board[index] !== null) {
      return { success: false, error: 'Invalid cell position', state: game };
    }

    if (playerSymbol && playerSymbol !== game.currentTurn) {
      return { success: false, error: "Not your turn", state: game };
    }

    game.board[index] = game.currentTurn;
    game.movesCount += 1;

    // Check winner
    const winResult = this.checkWinner(game.board);
    if (winResult) {
      game.winner = winResult.winner;
      game.winningLine = winResult.line;
    } else if (game.movesCount === 9) {
      game.isDraw = true;
    } else {
      game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
    }

    return { success: true, state: game };
  }

  checkWinner(b) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [x, y, z] of lines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return { winner: b[x], line: [x, y, z] };
      }
    }
    return null;
  }

  getState(roomId) {
    return this.games.get(roomId) || this.createGame(roomId);
  }

  resetGame(roomId) {
    return this.createGame(roomId);
  }
}

const ticTacToeEngine = new TicTacToeEngine();
module.exports = ticTacToeEngine;
