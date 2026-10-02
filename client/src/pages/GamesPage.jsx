import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  RotateCcw, 
  Sparkles, 
  Play, 
  Check, 
  Award,
  Zap,
  HelpCircle,
  Scissors
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import api from '../services/api';

const GamesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [selectedGame, setSelectedGame] = useState('tictactoe'); // 'chess' | 'tictactoe' | 'rps' | 'quiz'
  const [activeRoom, setActiveRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chess board state helpers
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Fetch initial leaderboard and stats
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const [boardRes, statsRes] = await Promise.all([
          api.get('/games/leaderboard').catch(() => ({ data: { data: [] } })),
          api.get('/games/stats').catch(() => ({ data: { data: null } })),
        ]);
        setLeaderboard(boardRes.data?.data || []);
        setMyStats(statsRes.data?.data || null);
      } catch (err) {
        console.error('Fetch game stats error:', err);
      }
    };
    fetchGameData();
  }, []);

  // Socket room updates
  useEffect(() => {
    if (!socket || !activeRoom) return;

    socket.emit('game:join', { roomId: activeRoom.roomId, userId: user?._id || user?.id });

    const handleGameUpdate = (room) => {
      setActiveRoom(room);
      setGameState(room.gameState);
    };

    const handleGameState = ({ gameState: state }) => {
      setGameState(state);
    };

    socket.on('game:updated', handleGameUpdate);
    socket.on('game:state', handleGameState);

    return () => {
      socket.off('game:updated', handleGameUpdate);
      socket.off('game:state', handleGameState);
    };
  }, [socket, activeRoom, user]);

  const handleCreateRoom = async (gameType) => {
    setLoading(true);
    try {
      const res = await api.post('/games/rooms', { gameType });
      if (res.data?.success) {
        setActiveRoom(res.data.data);
        setGameState(res.data.data.gameState);
      }
    } catch (err) {
      console.error('Create room error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // TIC TAC TOE MOVE HANDLER
  // ----------------------------------------------------
  const handleTicTacToeCellClick = (index) => {
    if (!activeRoom || !socket) return;
    socket.emit('game:move', {
      roomId: activeRoom.roomId,
      userId: user?._id || user?.id,
      moveData: { index },
    });
  };

  // ----------------------------------------------------
  // CHESS MOVE HANDLER
  // ----------------------------------------------------
  const handleChessSquareClick = (squareIndex) => {
    if (!activeRoom || !socket) return;
    const file = String.fromCharCode(97 + (squareIndex % 8));
    const rank = 8 - Math.floor(squareIndex / 8);
    const square = `${file}${rank}`;

    if (!selectedPiece) {
      setSelectedPiece(square);
    } else {
      socket.emit('game:move', {
        roomId: activeRoom.roomId,
        userId: user?._id || user?.id,
        moveData: { from: selectedPiece, to: square, promotion: 'q' },
      });
      setSelectedPiece(null);
    }
  };

  // ----------------------------------------------------
  // ROCK PAPER SCISSORS HANDLER
  // ----------------------------------------------------
  const handleRPSChoice = (choice) => {
    if (!activeRoom || !socket) return;
    socket.emit('game:move', {
      roomId: activeRoom.roomId,
      userId: user?._id || user?.id,
      moveData: { choice },
    });
  };

  // ----------------------------------------------------
  // QUIZ ANSWER HANDLER
  // ----------------------------------------------------
  const handleQuizAnswer = (optionIndex) => {
    if (!activeRoom || !socket) return;
    socket.emit('game:move', {
      roomId: activeRoom.roomId,
      userId: user?._id || user?.id,
      moveData: { optionIndex },
    });
  };

  const handleRematch = () => {
    if (!activeRoom || !socket) return;
    socket.emit('game:rematch', { roomId: activeRoom.roomId });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-vyntra-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-violet-400" />
            <span>VYNTRA Multiplayer Arcade</span>
          </h2>
          <p className="text-xs text-slate-400">Competitive real-time peer gaming with synchronized state engines</p>
        </div>

        {/* User Stats Pill */}
        <div className="flex items-center gap-3 bg-vyntra-card px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
          <Trophy className="w-4 h-4 text-amber-400" />
          <div className="text-xs">
            <span className="text-slate-400">Your Rating: </span>
            <strong className="text-white font-mono">{myStats?.rating || 1350} ELO</strong>
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[
          { id: 'tictactoe', label: 'Tic-Tac-Toe', icon: Play, desc: '3x3 Quick Tactical Match' },
          { id: 'chess', label: 'Chess Blitz', icon: Award, desc: '8x8 Grandmaster Arena' },
          { id: 'rps', label: 'Rock Paper Scissors', icon: Scissors, desc: 'Best of 3 Simultaneous Clashes' },
          { id: 'quiz', label: 'Tech & AI Trivia', icon: HelpCircle, desc: 'Live Multiplayer Quiz Battle' },
        ].map((g) => {
          const Icon = g.icon;
          const isSelected = selectedGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGame(g.id);
                setActiveRoom(null);
                setGameState(null);
              }}
              className={`p-4 rounded-2xl flex items-center gap-3 text-left transition-all flex-shrink-0 min-w-[200px] ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/50 shadow-glow-sm'
                  : 'bg-vyntra-card hover:bg-vyntra-surface border border-white/5'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">{g.label}</h4>
                <p className="text-[10px] text-slate-400">{g.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Game Session Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Game Arena */}
        <div className="lg:col-span-2 bg-vyntra-card rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center min-h-[480px] shadow-2xl relative">
          {!activeRoom ? (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-sm">
                <Gamepad2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white capitalize">{selectedGame} Room</h3>
                <p className="text-xs text-slate-400">Launch a new synchronized multiplayer room or invite a peer.</p>
              </div>
              <button
                onClick={() => handleCreateRoom(selectedGame)}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-sm transition-all hover:scale-105"
              >
                {loading ? 'Initializing Session...' : 'Create Multiplayer Room'}
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6 flex flex-col items-center">
              {/* Match Header */}
              <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">Room:</span>
                  <span className="font-mono font-bold text-cyan-400">{activeRoom.roomId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRematch}
                    className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 font-semibold text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset / Rematch</span>
                  </button>
                </div>
              </div>

              {/* ----------------- TIC TAC TOE BOARD ----------------- */}
              {selectedGame === 'tictactoe' && gameState && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-300">
                    {gameState.winner ? (
                      <span className="text-emerald-400 text-sm font-extrabold">Winner: Player {gameState.winner}! 🎉</span>
                    ) : gameState.isDraw ? (
                      <span className="text-amber-400 text-sm font-extrabold">Game Ended in a Draw!</span>
                    ) : (
                      <span>Current Turn: <strong className="text-indigo-400 font-mono text-sm">{gameState.currentTurn}</strong></span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-vyntra-bg/80 p-4 rounded-3xl border border-white/10 shadow-inner">
                    {(gameState.board || Array(9).fill(null)).map((cell, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTicTacToeCellClick(idx)}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-vyntra-surface/50 border border-white/10 hover:border-indigo-500/50 flex items-center justify-center font-extrabold text-3xl transition-all ${
                          cell === 'X' ? 'text-indigo-400' : cell === 'O' ? 'text-cyan-400' : 'text-slate-600'
                        } ${gameState.winningLine?.includes(idx) ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400' : ''}`}
                      >
                        {cell}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- CHESS BOARD ----------------- */}
              {selectedGame === 'chess' && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-300">
                    <span>Turn: <strong className="text-cyan-400 uppercase font-mono">{gameState?.turn === 'w' ? 'White' : 'Black'}</strong></span>
                  </div>

                  {/* 8x8 Chess Grid Representation */}
                  <div className="grid grid-cols-8 gap-0 border-2 border-indigo-500/40 rounded-2xl overflow-hidden shadow-2xl">
                    {Array.from({ length: 64 }).map((_, idx) => {
                      const row = Math.floor(idx / 8);
                      const col = idx % 8;
                      const isDark = (row + col) % 2 === 1;

                      // Starting setup piece glyphs for visual demonstration
                      const pieceMap = {
                        0: '♜', 1: '♞', 2: '♝', 3: '♛', 4: '♚', 5: '♝', 6: '♞', 7: '♜',
                        8: '♟', 9: '♟', 10: '♟', 11: '♟', 12: '♟', 13: '♟', 14: '♟', 15: '♟',
                        48: '♙', 49: '♙', 50: '♙', 51: '♙', 52: '♙', 53: '♙', 54: '♙', 55: '♙',
                        56: '♖', 57: '♘', 58: '♗', 59: '♕', 60: '♔', 61: '♗', 62: '♘', 63: '♖',
                      };

                      return (
                        <button
                          key={idx}
                          onClick={() => handleChessSquareClick(idx)}
                          className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors ${
                            isDark ? 'bg-indigo-950/80 text-slate-200' : 'bg-slate-800/80 text-slate-100'
                          } hover:bg-indigo-600/40`}
                        >
                          {pieceMap[idx] || ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ----------------- ROCK PAPER SCISSORS ----------------- */}
              {selectedGame === 'rps' && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="text-center space-y-1">
                    <h4 className="font-bold text-sm text-white">Choose Your Move</h4>
                    <p className="text-xs text-slate-400">Moves are revealed simultaneously</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {[
                      { id: 'rock', emoji: '✊', label: 'Rock' },
                      { id: 'paper', emoji: '✋', label: 'Paper' },
                      { id: 'scissors', emoji: '✌️', label: 'Scissors' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleRPSChoice(btn.id)}
                        className="w-24 h-24 rounded-3xl bg-vyntra-surface/50 border border-white/10 hover:border-indigo-500 hover:scale-105 flex flex-col items-center justify-center gap-1 shadow-lg transition-all"
                      >
                        <span className="text-3xl">{btn.emoji}</span>
                        <span className="text-xs font-bold text-slate-300">{btn.label}</span>
                      </button>
                    ))}
                  </div>

                  {gameState?.roundHistory?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-vyntra-surface/30 border border-white/5 w-full max-w-sm text-xs space-y-2">
                      <p className="font-bold text-white">Round History:</p>
                      {gameState.roundHistory.map((rh, i) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>Round {rh.round}</span>
                          <span className="font-bold text-emerald-400 uppercase">Winner: {rh.winner}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- TRIVIA QUIZ ----------------- */}
              {selectedGame === 'quiz' && (
                <div className="space-y-6 w-full max-w-md">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Question {(gameState?.currentQuestionIndex || 0) + 1} of 5
                    </span>
                    <h4 className="font-bold text-sm text-white pt-2">
                      {gameState?.questions?.[gameState.currentQuestionIndex || 0]?.question}
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {gameState?.questions?.[gameState.currentQuestionIndex || 0]?.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizAnswer(optIdx)}
                        className="w-full p-3.5 rounded-2xl bg-vyntra-surface/60 border border-white/10 hover:border-indigo-500/60 hover:bg-indigo-600/20 text-left text-xs text-white font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Arcade Leaderboard & Achievements */}
        <div className="bg-vyntra-card rounded-3xl p-5 border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-vyntra-border/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Global Rankings</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Live Elo Matrix</span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-vyntra-surface/30 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-4 font-mono font-bold text-xs ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img
                    src={item.userDetail?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vyntra'}
                    alt="Player"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{item.userDetail?.displayName || 'Player'}</p>
                    <p className="text-[10px] text-slate-400">{item.wins} Wins • {item.draws || 0} Draws</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                  {item.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
