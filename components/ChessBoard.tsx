
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, X, MoreVertical, Loader2 } from 'lucide-react';
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [displayGame, setDisplayGame] = useState(new Chess(game.fen()));
  const [showTools, setShowTools] = useState(false);
  
  const timerRef = useRef<any>(null);

  // Initialize times ONLY once or when props change specifically for a NEW game
  // We avoid resetting them on every turn/render if the base values are the same.
  const prevGameRef = useRef<string>(game.fen());
  useEffect(() => {
    if (prevGameRef.current !== game.fen() && game.history().length === 0) {
      setWTime(whiteTime);
      setBTime(blackTime);
      prevGameRef.current = game.fen();
    }
  }, [whiteTime, blackTime, game]);

  useEffect(() => {
    if (historyIndex === -1) {
      setDisplayGame(new Chess(game.fen()));
    }
  }, [game, historyIndex]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (game.isGameOver()) return;

    timerRef.current = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game, onTimeOut]);

  const handleSquareClick = useCallback((square: string) => {
    if (historyIndex !== -1) return;
    
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

  const navigate = (dir: 'back' | 'next') => {
    const history = game.history();
    if (history.length === 0) return;

    let newIdx = historyIndex === -1 ? history.length - 1 : historyIndex;
    
    if (dir === 'back') {
      newIdx = Math.max(0, newIdx - (historyIndex === -1 ? 1 : 1));
      if (historyIndex === -1) newIdx = history.length - 1;
      else if (newIdx === historyIndex) newIdx = Math.max(0, historyIndex - 1);
      
      // If we are at the very beginning
      if (historyIndex === 0 && dir === 'back') return;
      
      setHistoryIndex(newIdx);
    } else {
      if (historyIndex === -1) return;
      newIdx = historyIndex + 1;
      if (newIdx >= history.length) {
        setHistoryIndex(-1);
        return;
      }
      setHistoryIndex(newIdx);
    }
    
    const temp = new Chess();
    const targetIdx = newIdx;
    for (let i = 0; i <= targetIdx; i++) temp.move(history[i]);
    setDisplayGame(temp);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-4 lg:p-10 animate-fade-in text-white overflow-hidden">
      
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* Left Side: Infos Adversaire (Desktop) / Mobile Top */}
        <div className="w-full max-w-[550px] lg:max-w-[300px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xl lg:text-3xl">
              {playerTop?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-xl font-black text-slate-200">{playerTop?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-500 uppercase tracking-widest">{playerTop?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[180px] text-center shadow-2xl ${bTime < 30 && bTime > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(bTime)}
          </div>
        </div>

        {/* Center: The Board */}
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
                  {historyIndex !== -1 && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />}
                </div>
              );
            }))}
          </div>
          {historyIndex !== -1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="px-6 py-2 lg:px-10 lg:py-4 bg-blue-600/90 backdrop-blur-md rounded-full font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-2xl border border-blue-400 animate-pulse">Visionnage Historique</div>
            </div>
          )}
        </div>

        {/* Right Side: Infos Joueur (Desktop) / Mobile Bottom */}
        <div className="w-full max-w-[550px] lg:max-w-[300px] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 order-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center font-black text-xl lg:text-3xl shadow-xl shadow-blue-500/20">
              {playerBottom?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm lg:text-xl font-black text-white">{playerBottom?.name}</p>
              <p className="text-[10px] lg:text-xs font-black text-blue-400 uppercase tracking-widest">{playerBottom?.elo} ELO</p>
            </div>
          </div>
          <div className={`px-4 py-2 lg:px-6 lg:py-4 rounded-2xl font-mono text-2xl lg:text-5xl font-black min-w-[100px] lg:min-w-[180px] text-center shadow-2xl ${wTime < 30 && wTime > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
            {formatTime(wTime)}
          </div>

          {/* Desktop Controls integrated here */}
          <div className="hidden lg:grid grid-cols-2 gap-3 w-full mt-10">
            <button onClick={() => navigate('back')} className="h-16 bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95"><ChevronLeft size={32} /></button>
            <button onClick={() => navigate('next')} className="h-16 bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-30" disabled={historyIndex === -1}><ChevronRight size={32} /></button>
            <button onClick={() => setShowTools(true)} className="h-16 bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-all active:scale-95"><MoreVertical size={32} /></button>
            <button onClick={() => { if(confirm("Abandonner ?")) onExit(); }} className="h-16 bg-red-600 rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-500/20"><RotateCcw size={32} /></button>
          </div>
        </div>
      </div>

      {/* Mobile-Only Controls */}
      <div className="lg:hidden w-full max-w-[550px] grid grid-cols-4 gap-3 px-4 pt-8 shrink-0">
        <button onClick={() => navigate('back')} className="h-14 bg-slate-800 rounded-2xl flex items-center justify-center active:bg-blue-600"><ChevronLeft size={28} /></button>
        <button onClick={() => navigate('next')} className="h-14 bg-slate-800 rounded-2xl flex items-center justify-center active:bg-blue-600 disabled:opacity-30" disabled={historyIndex === -1}><ChevronRight size={28} /></button>
        <button onClick={() => setShowTools(true)} className="h-14 bg-slate-800 rounded-2xl flex items-center justify-center active:bg-slate-700"><MoreVertical size={28} /></button>
        <button onClick={() => { if(confirm("Abandonner ?")) onExit(); }} className="h-14 bg-red-600 rounded-2xl flex items-center justify-center active:bg-red-700"><RotateCcw size={28} /></button>
      </div>

      {/* Tools Modal */}
      {showTools && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex items-end animate-fade-in">
           <div className="w-full bg-slate-900 rounded-t-[40px] p-8 pb-12 animate-fade-in-up border-t border-slate-800 shadow-3xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black tracking-tighter">Options</h3>
                <button onClick={() => setShowTools(false)} className="p-3 bg-slate-800 rounded-full"><X/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { if(confirm("Abandonner la partie ?")) { onExit(); setShowTools(false); } }} className="p-8 bg-red-500/10 text-red-500 rounded-3xl flex flex-col items-center space-y-3 border border-red-500/20 transition-colors">
                  <RotateCcw size={40} /> <span className="font-black text-[10px] uppercase tracking-widest">Abandonner</span>
                </button>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-8 bg-slate-800 rounded-3xl flex flex-col items-center space-y-3 border border-slate-700 transition-colors">
                  {soundEnabled ? <Volume2 size={40}/> : <VolumeX size={40}/>}
                  <span className="font-black text-[10px] uppercase tracking-widest">{soundEnabled ? 'Sons On' : 'Sons Off'}</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
