class RPSEngine {
  constructor() {
    this.games = new Map();
  }

  createGame(roomId) {
    const state = {
      round: 1,
      maxRounds: 3,
      choices: {}, // { userId: 'rock' | 'paper' | 'scissors' }
      scores: {},  // { userId: number }
      roundHistory: [],
      winner: null,
      status: 'choosing', // 'choosing', 'revealed', 'finished'
    };
    this.games.set(roomId, state);
    return state;
  }

  makeChoice(roomId, userId, choice) {
    const game = this.games.get(roomId) || this.createGame(roomId);

    if (!['rock', 'paper', 'scissors'].includes(choice)) {
      return { success: false, error: 'Invalid choice' };
    }

    game.choices[userId] = choice;

    const userIds = Object.keys(game.choices);
    if (userIds.length >= 2) {
      // Both made choice - resolve round
      const [u1, u2] = userIds;
      const c1 = game.choices[u1];
      const c2 = game.choices[u2];

      game.scores[u1] = game.scores[u1] || 0;
      game.scores[u2] = game.scores[u2] || 0;

      let roundWinner = null;
      if (c1 === c2) {
        roundWinner = 'draw';
      } else if (
        (c1 === 'rock' && c2 === 'scissors') ||
        (c1 === 'paper' && c2 === 'rock') ||
        (c1 === 'scissors' && c2 === 'paper')
      ) {
        roundWinner = u1;
        game.scores[u1] += 1;
      } else {
        roundWinner = u2;
        game.scores[u2] += 1;
      }

      game.roundHistory.push({
        round: game.round,
        choices: { [u1]: c1, [u2]: c2 },
        winner: roundWinner,
      });

      game.status = 'revealed';

      if (game.scores[u1] >= 2) {
        game.winner = u1;
        game.status = 'finished';
      } else if (game.scores[u2] >= 2) {
        game.winner = u2;
        game.status = 'finished';
      } else {
        game.round += 1;
      }
    }

    return { success: true, state: game };
  }

  nextRound(roomId) {
    const game = this.games.get(roomId);
    if (game && game.status === 'revealed') {
      game.choices = {};
      game.status = 'choosing';
    }
    return game;
  }

  getState(roomId) {
    return this.games.get(roomId) || this.createGame(roomId);
  }

  resetGame(roomId) {
    return this.createGame(roomId);
  }
}

const rpsEngine = new RPSEngine();
module.exports = rpsEngine;
