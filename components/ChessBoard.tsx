
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, X, MoreVertical, Loader2, Play, Square } from 'lucide-react';
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
        for (let i = 0; i <= historyIndex; i++) temp.move(history[i]);
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
        setHistoryIndex(-1); // Revenir au présent si clic
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
    const h = game.history();
    if (h.length === 0) return;

    let newIdx = historyIndex;
    if (dir === 'back') {
        if (newIdx === -1) newIdx = h.length - 1;
        else newIdx = Math.max(0, newIdx - 1);
    } else {
        if (newIdx === -1) return;
        newIdx = newIdx + 1;
        if (newIdx >= h.length) newIdx = -1;
    }
    setHistoryIndex(newIdx);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-4 lg:p-10 animate-fade-in text-white overflow-hidden">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* Adversaire (Haut) */}
        <div className="w-full max-w-[550px] lg:max-w-[300px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl lg:text-3xl">
              {playerTop?.avatar || playerTop?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-xl font-black text-slate-200">{playerTop?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-500 uppercase tracking-widest">{playerTop?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[180px] text-center shadow-2xl transition-colors ${bTime < 30 && bTime > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(bTime)}
          </div>
        </div>

        {/* Plateau Central */}
        <div className="relative w-full aspect-square max-w-[550px] order-2">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 border-[6px] lg:border-[12px] border-slate-800 shadow-3xl rounded-xl overflow-hidden bg-slate-900 relative">
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
                  className={`relative flex items-center justify-center cursor-pointer select-none ${isDark ? 'bg-[#3b66d6]' : 'bg-[#f0f4ff]'} ${isSelected ? 'ring-4 ring-inset ring-yellow-400/60 bg-yellow-200/40' : ''}`}
                >
                  {cI === 0 && <span className={`absolute top-0.5 left-0.5 text-[8px] lg:text-[10px] font-bold ${isDark ? 'text-white/40' : 'text-blue-900/40'}`}>{8 - rI}</span>}
                  {rI === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] lg:text-[10px] font-bold ${isDark ? 'text-white/40' : 'text-blue-900/40'}`}>{'abcdefgh'[cI]}</span>}
                  {pieceKey && <img src={PIECE_IMAGES[pieceKey]} className="w-[90%] h-[90%] z-10 drop-shadow-md" />}
                  {isPossible && <div className="absolute w-3 h-3 lg:w-5 lg:h-5 rounded-full bg-black/15 z-20" />}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Vous (Bas) */}
        <div className="w-full max-w-[550px] lg:max-w-[300px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center font-black text-xl lg:text-3xl shadow-xl shadow-blue-500/20">
              {playerBottom?.avatar || playerBottom?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-xl font-black text-white">{playerBottom?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-400 uppercase tracking-widest">{playerBottom?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[180px] text-center shadow-2xl transition-colors ${wTime < 30 && wTime > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(wTime)}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="flex items-center space-x-4">
            <button onClick={() => navigateHistory('back')} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors">
                <ChevronLeft size={24}/>
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {historyIndex === -1 ? "Présent" : `Coup ${historyIndex + 1}`}
            </div>
            <button onClick={() => navigateHistory('next')} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors">
                <ChevronRight size={24}/>
            </button>
        </div>
        <button onClick={() => { if(confirm("Voulez-vous abandonner ?")) onExit(); }} className="px-10 py-4 bg-red-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">Abandonner la partie</button>
      </div>
    </div>
  );
};
