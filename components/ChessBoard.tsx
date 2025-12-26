
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  whiteTime: number; 
  blackTime: number; 
  onTimeOut: (winner: 'white' | 'black') => void;
  onExit: () => void;
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

export const ChessBoard: React.FC<ChessBoardProps> = ({ game, onMove, playerTop, playerBottom, whiteTime, blackTime, onTimeOut, onExit }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  
  const [wTime, setWTime] = useState(whiteTime);
  const [bTime, setBTime] = useState(blackTime);
  const initialSyncRef = useRef(false);
  
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [displayGame, setDisplayGame] = useState(new Chess(game.fen()));
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!initialSyncRef.current) {
      setWTime(whiteTime);
      setBTime(blackTime);
      initialSyncRef.current = true;
    }
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (historyIndex === -1) {
      setDisplayGame(new Chess(game.fen()));
    } else {
      const history = game.history();
      const temp = new Chess();
      for (let i = 0; i <= historyIndex; i++) {
        temp.move(history[i]);
      }
      setDisplayGame(temp);
    }
  }, [game, historyIndex]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (game.isGameOver()) return;

    timerRef.current = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWTime(prev => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
            onTimeOut('black');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBTime(prev => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
            onTimeOut('white');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game, onTimeOut]);

  const handleSquareClick = useCallback((square: string) => {
    if (historyIndex !== -1) {
        setHistoryIndex(-1);
        return;
    }
    
    if (selectedSquare) {
      if (onMove(selectedSquare, square)) {
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
  }, [selectedSquare, game, onMove, historyIndex]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateHistory = (dir: 'back' | 'next') => {
    const history = game.history();
    if (history.length === 0) return;

    if (dir === 'back') {
      if (historyIndex === -1) {
        setHistoryIndex(history.length - 1);
      } else {
        setHistoryIndex(Math.max(0, historyIndex - 1));
      }
    } else {
      if (historyIndex === -1) return;
      if (historyIndex === history.length - 1) {
        setHistoryIndex(-1);
      } else {
        setHistoryIndex(historyIndex + 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-4 animate-fade-in text-white overflow-hidden">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">
        
        {/* Top Player (Opponent) */}
        <div className="w-full max-w-[500px] lg:max-w-[280px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl lg:text-3xl">
              {playerTop?.avatar || playerTop?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm lg:text-lg font-black text-slate-200 truncate">{playerTop?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-500 uppercase tracking-widest">{playerTop?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[160px] text-center shadow-2xl transition-all duration-300 ${bTime < 30 && bTime > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(bTime)}
          </div>
        </div>

        {/* Board */}
        <div className="relative w-full aspect-square max-w-[500px] order-2 group">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 border-[6px] lg:border-[10px] border-slate-800 shadow-3xl rounded-xl overflow-hidden bg-slate-900 relative">
            {displayGame.board().map((row: any[], rI: number) => row.map((piece: any, cI: number) => {
              const sq = `${'abcdefgh'[cI]}${8 - rI}`;
              const isDark = (rI + cI) % 2 === 1;
              const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
              const isPossible = possibleMoves.includes(sq);
              const isSelected = selectedSquare === sq;

              return (
                <div 
                  key={sq} 
                  onClick={() => handleSquareClick(sq)} 
                  className={`relative flex items-center justify-center cursor-pointer select-none transition-all duration-200 ${isDark ? 'bg-[#3b66d6]' : 'bg-[#f0f4ff]'} ${isSelected ? 'ring-4 ring-inset ring-yellow-400/80 bg-yellow-200/50' : ''}`}
                >
                  {cI === 0 && <span className={`absolute top-0.5 left-0.5 text-[8px] lg:text-[9px] font-black ${isDark ? 'text-white/30' : 'text-blue-900/30'}`}>{8 - rI}</span>}
                  {rI === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] lg:text-[9px] font-black ${isDark ? 'text-white/30' : 'text-blue-900/30'}`}>{'abcdefgh'[cI]}</span>}
                  {pieceKey && <img src={PIECE_IMAGES[pieceKey]} className="w-[90%] h-[90%] z-10 drop-shadow-xl transform active:scale-110 transition-transform" />}
                  {isPossible && <div className="absolute w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-black/20 z-20" />}
                </div>
              );
            }))}
            {historyIndex !== -1 && (
              <div className="absolute inset-0 bg-blue-600/5 pointer-events-none flex items-center justify-center">
                 <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Analyse Historique</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Player (You) */}
        <div className="w-full max-w-[500px] lg:max-w-[280px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center font-black text-xl lg:text-3xl shadow-xl shadow-blue-500/20">
              {playerBottom?.avatar || playerBottom?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-lg font-black text-white">{playerBottom?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-400 uppercase tracking-widest">{playerBottom?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[160px] text-center shadow-2xl transition-all duration-300 ${wTime < 30 && wTime > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(wTime)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-[24px] border border-white/5">
            <button 
              onClick={() => navigateHistory('back')} 
              className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-90 disabled:opacity-30"
              disabled={game.history().length === 0}
            >
                <ChevronLeft size={24}/>
            </button>
            <div className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24 text-center">
                {historyIndex === -1 ? "LIVE" : `Coup ${historyIndex + 1}`}
            </div>
            <button 
              onClick={() => navigateHistory('next')} 
              className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-90 disabled:opacity-30"
              disabled={historyIndex === -1}
            >
                <ChevronRight size={24}/>
            </button>
        </div>
        <button 
          onClick={() => { if(confirm("Voulez-vous abandonner ?")) onExit(); }} 
          className="px-12 py-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-red-600 hover:text-white"
        >
          Abandonner
        </button>
      </div>
    </div>
  );
};
