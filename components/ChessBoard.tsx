
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, Focus } from 'lucide-react';
import { Chess } from 'chess.js';

interface PlayerInfo {
  name: string;
  elo: number;
  avatar?: string;
}

interface ChessBoardProps {
  game: any;
  onMove: (from: string, to: string) => boolean;
  playerTop?: PlayerInfo;
  playerBottom?: PlayerInfo;
  whiteTime: number; // en secondes
  blackTime: number; // en secondes
  onTimeOut: (winner: 'white' | 'black') => void;
}

const PIECE_IMAGES: {[key: string]: string} = {
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

const SOUND_URLS = {
  move: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/check.mp3',
  mate: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/game-end.mp3'
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ game, onMove, playerTop, playerBottom, whiteTime, blackTime, onTimeOut }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [wTime, setWTime] = useState(whiteTime);
  const [bTime, setBTime] = useState(blackTime);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [displayGame, setDisplayGame] = useState(new Chess(game.fen()));

  // Reset timers when game starts
  useEffect(() => {
      setWTime(whiteTime);
      setBTime(blackTime);
  }, [whiteTime, blackTime]);

  // Sync display game when main game updates
  useEffect(() => {
      if (historyIndex === -1) {
          setDisplayGame(new Chess(game.fen()));
      }
  }, [game, historyIndex]);

  // Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (game.isGameOver()) return;
      if (game.turn() === 'w') {
        setWTime(prev => {
           if (prev <= 0) { onTimeOut('black'); return 0; }
           return prev - 1;
        });
      } else {
        setBTime(prev => {
           if (prev <= 0) { onTimeOut('white'); return 0; }
           return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [game, onTimeOut]);

  const playSound = (type: keyof typeof SOUND_URLS) => {
    if (soundEnabled) {
      const audio = new Audio(SOUND_URLS[type]);
      audio.play().catch(() => {});
    }
  };

  const handleSquareClick = useCallback((square: string) => {
    if (historyIndex !== -1) return; // Empêcher de jouer en mode consultation d'historique

    if (selectedSquare) {
      const pieceOnTarget = game.get(square);
      if (onMove(selectedSquare, square)) {
        if (game.isCheckmate()) playSound('mate');
        else if (game.inCheck()) playSound('check');
        else if (pieceOnTarget) playSound('capture');
        else playSound('move');
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setPossibleMoves(game.moves({ square, verbose: true }).map((m: any) => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [selectedSquare, game, onMove, historyIndex, soundEnabled]);

  const navigateHistory = (direction: 'back' | 'next' | 'reset') => {
      const totalMoves = game.history().length;
      let newIndex = historyIndex;

      if (direction === 'reset') newIndex = -1;
      else if (direction === 'back') {
          if (historyIndex === -1) newIndex = totalMoves - 1;
          else if (historyIndex > 0) newIndex--;
      } else if (direction === 'next') {
          if (historyIndex === -1) return;
          if (historyIndex < totalMoves - 1) newIndex++;
          else newIndex = -1;
      }

      setHistoryIndex(newIndex);
      if (newIndex === -1) {
          setDisplayGame(new Chess(game.fen()));
      } else {
          const temp = new Chess();
          const history = game.history();
          for (let i = 0; i <= newIndex; i++) {
              temp.move(history[i]);
          }
          setDisplayGame(temp);
      }
  };

  const board = displayGame.board();

  const PlayerCard = ({ player, time, isTurn }: { player?: PlayerInfo, time: number, isTurn: boolean }) => (
    <div className={`flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-[32px] border ${isTurn ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-slate-100 dark:border-slate-800'} transition-all`}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xl border-2 border-white dark:border-slate-700 shadow-sm">
            {player?.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : player?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-black text-sm truncate max-w-[120px]">{player?.name}</p>
          <p className="text-[10px] font-black text-blue-500 uppercase">{player?.elo} ELO</p>
        </div>
      </div>
      <div className={`px-5 py-2 rounded-2xl font-mono text-2xl font-black ${time < 30 ? 'text-red-500 bg-red-50 dark:bg-red-900/10 animate-pulse' : 'text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800'}`}>
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-6xl mx-auto py-2">
      
      <div className="w-full max-w-[550px] space-y-4">
        <PlayerCard player={playerTop} time={bTime} isTurn={game.turn() === 'b' && !game.isGameOver()} />
        
        <div className="aspect-square bg-slate-900 rounded-[48px] p-4 shadow-3xl relative overflow-hidden ring-4 ring-slate-200 dark:ring-slate-800">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-[32px] overflow-hidden">
            {board.map((row: any[], rI: number) => row.map((piece: any, cI: number) => {
              const sq = `${'abcdefgh'[cI]}${8 - rI}`;
              const isDark = (rI + cI) % 2 === 1;
              const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
              const isPossible = possibleMoves.includes(sq);
              const isSelected = selectedSquare === sq;

              return (
                <div 
                  key={sq} 
                  onClick={() => handleSquareClick(sq)} 
                  className={`relative flex items-center justify-center transition-all ${isDark ? 'bg-[#2b59c3]' : 'bg-[#e0e7ff]'} ${isSelected ? 'bg-yellow-400/50 shadow-inner' : ''}`}
                >
                  {pieceKey && <img src={PIECE_IMAGES[pieceKey]} className="w-[88%] h-[88%] z-10 drop-shadow-xl transform hover:scale-110 active:scale-95 transition-transform" draggable={false} />}
                  {isPossible && <div className={`absolute w-4 h-4 rounded-full z-20 ${piece ? 'ring-4 ring-black/20' : 'bg-black/10'}`} />}
                </div>
              );
            }))}
          </div>
          {historyIndex !== -1 && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center z-30">
                  <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-xs shadow-2xl animate-bounce">
                    MODE CONSULTATION
                  </div>
              </div>
          )}
        </div>

        <PlayerCard player={playerBottom} time={wTime} isTurn={game.turn() === 'w' && !game.isGameOver()} />
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           <h4 className="font-black uppercase text-xs tracking-widest text-slate-400 text-center">Outils de Jeu</h4>
           
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
              <button onClick={() => navigateHistory('back')} className="p-4 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><ChevronLeft size={28}/></button>
              <button onClick={() => navigateHistory('reset')} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"><RotateCcw size={24}/></button>
              <button onClick={() => navigateHistory('next')} className="p-4 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><ChevronRight size={28}/></button>
           </div>

           <div className="space-y-3">
               <button 
                 onClick={() => setSoundEnabled(!soundEnabled)}
                 className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all ${soundEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
               >
                 {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                 <span>{soundEnabled ? 'Sons Activés' : 'Sons Coupés'}</span>
               </button>
               <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center justify-center space-x-2">
                  <Focus size={16} /> <span>Analyse par IA</span>
               </button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm h-72 overflow-y-auto custom-scrollbar">
            <h4 className="font-black uppercase text-xs tracking-widest text-slate-400 mb-6">Feuille de Partie</h4>
            <div className="grid grid-cols-2 gap-3">
                {game.history().map((move: string, i: number) => (
                    <div key={i} className={`p-3 rounded-xl text-sm font-bold flex items-center ${i === historyIndex ? 'bg-blue-600 text-white' : i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                       <span className="opacity-40 w-8">{i % 2 === 0 ? Math.floor(i/2)+1 + '.' : ''}</span> {move}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
