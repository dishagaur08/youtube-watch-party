class QuizEngine {
  constructor() {
    this.games = new Map();
    this.questionBank = [
      {
        id: 'q1',
        question: 'Which protocol is used by WebRTC for real-time peer-to-peer media transmission?',
        options: ['HTTP/3', 'SRTP / UDP', 'FTP', 'SMTP'],
        correctIndex: 1,
        timeLimit: 15,
      },
      {
        id: 'q2',
        question: 'In artificial intelligence, what does RAG stand for?',
        options: ['Recurrent Auto Generator', 'Retrieval-Augmented Generation', 'Rapid Adaptive Gradient', 'Relational Array Graph'],
        correctIndex: 1,
        timeLimit: 15,
      },
      {
        id: 'q3',
        question: 'In Chess, what is the special pawn capture called when an enemy pawn moves 2 squares past it?',
        options: ['Castling', 'Promotion', 'En Passant', 'Fork'],
        correctIndex: 2,
        timeLimit: 15,
      },
      {
        id: 'q4',
        question: 'What is the primary transport layer protocol underlying Socket.IO standard fallbacks?',
        options: ['WebSocket & HTTP Long-Polling', 'TCP direct raw', 'UDP broadcast', 'QUIC only'],
        correctIndex: 0,
        timeLimit: 15,
      },
      {
        id: 'q5',
        question: 'Which vector similarity metric measures the cosine of the angle between two embedding vectors?',
        options: ['Euclidean Distance', 'Cosine Similarity', 'Manhattan Norm', 'Hamming Distance'],
        correctIndex: 1,
        timeLimit: 15,
      }
    ];
  }

  createGame(roomId) {
    const state = {
      currentQuestionIndex: 0,
      totalQuestions: this.questionBank.length,
      questions: this.questionBank,
      answers: {}, // { questionIndex: { userId: chosenOption } }
      scores: {},  // { userId: number }
      status: 'playing', // 'playing', 'round_result', 'finished'
      startTime: Date.now(),
    };
    this.games.set(roomId, state);
    return state;
  }

  submitAnswer(roomId, userId, optionIndex) {
    const game = this.games.get(roomId) || this.createGame(roomId);
    const qIndex = game.currentQuestionIndex;
    const currentQ = game.questions[qIndex];

    game.answers[qIndex] = game.answers[qIndex] || {};
    if (game.answers[qIndex][userId] !== undefined) {
      return { success: false, error: 'Answer already submitted for this round', state: game };
    }

    game.answers[qIndex][userId] = optionIndex;
    game.scores[userId] = game.scores[userId] || 0;

    if (optionIndex === currentQ.correctIndex) {
      game.scores[userId] += 100;
    }

    return { success: true, state: game };
  }

  nextQuestion(roomId) {
    const game = this.games.get(roomId);
    if (!game) return null;

    if (game.currentQuestionIndex + 1 < game.totalQuestions) {
      game.currentQuestionIndex += 1;
      game.status = 'playing';
    } else {
      game.status = 'finished';
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

const quizEngine = new QuizEngine();
module.exports = quizEngine;
