
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Swords } from 'lucide-react';
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
  
  // États internes du minuteur pour éviter les resets intempestifs
  const [wTime, setWTime] = useState(whiteTime);
  const [bTime, setBTime] = useState(blackTime);
  const initialSyncDone = useRef(false);
  
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [displayGame, setDisplayGame] = useState(new Chess(game.fen()));
  const timerRef = useRef<any>(null);

  // Synchronisation initiale uniquement
  useEffect(() => {
    if (!initialSyncDone.current) {
      setWTime(whiteTime);
      setBTime(blackTime);
      initialSyncDone.current = true;
    }
  }, [whiteTime, blackTime]);

  // Navigation dans l'historique
  useEffect(() => {
    if (historyIndex === -1) {
      setDisplayGame(new Chess(game.fen()));
    } else {
      const history = game.history();
      const temp = new Chess();
      for (let i = 0; i <= historyIndex; i++) {
        try { temp.move(history[i]); } catch(e) {}
      }
      setDisplayGame(temp);
    }
  }, [game, historyIndex]);

  // Boucle du minuteur
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
    // Si on regarde l'historique, un clic ramène au présent
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

  const navigate = (dir: 'back' | 'next') => {
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
      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">
        
        {/* Joueur Adversaire (Haut) */}
        <div className="w-full max-w-[480px] lg:max-w-[260px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl lg:text-3xl shadow-lg">
              {playerTop?.avatar || playerTop?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm lg:text-lg font-black text-slate-200 truncate">{playerTop?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-500 uppercase tracking-widest">{playerTop?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[150px] text-center shadow-2xl transition-all duration-300 ${bTime < 30 && bTime > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(bTime)}
          </div>
        </div>

        {/* Plateau de Jeu */}
        <div className="relative w-full aspect-square max-w-[480px] order-2 group">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 border-[8px] lg:border-[12px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden bg-slate-900 relative">
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
                  className={`relative flex items-center justify-center cursor-pointer select-none transition-all duration-150 ${isDark ? 'bg-[#3b66d6]' : 'bg-[#f0f4ff]'} ${isSelected ? 'ring-4 ring-inset ring-yellow-400/80 bg-yellow-200/40' : ''}`}
                >
                  {cI === 0 && <span className={`absolute top-0.5 left-0.5 text-[8px] lg:text-[10px] font-black ${isDark ? 'text-white/20' : 'text-blue-900/20'}`}>{8 - rI}</span>}
                  {rI === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] lg:text-[10px] font-black ${isDark ? 'text-white/20' : 'text-blue-900/20'}`}>{'abcdefgh'[cI]}</span>}
                  {pieceKey && <img src={PIECE_IMAGES[pieceKey]} className="w-[88%] h-[88%] z-10 drop-shadow-lg transform transition-transform active:scale-110" />}
                  {isPossible && <div className="absolute w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-black/20 z-20" />}
                </div>
              );
            }))}
            {historyIndex !== -1 && (
              <div className="absolute inset-0 bg-blue-600/5 pointer-events-none flex items-center justify-center">
                 <div className="bg-blue-600/90 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm border border-blue-400/30">Mode Analyse</div>
              </div>
            )}
          </div>
        </div>

        {/* Joueur Local (Bas) */}
        <div className="w-full max-w-[480px] lg:max-w-[260px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center font-black text-xl lg:text-3xl shadow-xl shadow-blue-500/20">
              {playerBottom?.avatar || playerBottom?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-lg font-black text-white">{playerBottom?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-400 uppercase tracking-widest">{playerBottom?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[150px] text-center shadow-2xl transition-all duration-300 ${wTime < 30 && wTime > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(wTime)}
          </div>
        </div>
      </div>

      {/* Boutons de Navigation & Contrôles */}
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="flex items-center space-x-4 bg-slate-900/80 p-2 rounded-[28px] border border-white/10 shadow-2xl backdrop-blur-xl">
            <button 
              onClick={() => navigate('back')} 
              className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={game.history().length === 0}
            >
                <ChevronLeft size={28}/>
            </button>
            <div className="px-6 text-[10px] font-black uppercase tracking-tighter text-slate-400 min-w-[100px] text-center">
                {historyIndex === -1 ? "Présent" : `Coup ${historyIndex + 1}`}
            </div>
            <button 
              onClick={() => navigate('next')} 
              className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={historyIndex === -1}
            >
                <ChevronRight size={28}/>
            </button>
        </div>
        <button 
          onClick={() => { if(confirm("Abandonner la partie ?")) onExit(); }} 
          className="px-10 py-4 bg-red-600/10 text-red-500 border border-red-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
        >
          Abandonner
        </button>
      </div>
    </div>
  );
};
