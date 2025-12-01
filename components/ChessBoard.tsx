
import React, { useState, useEffect } from 'react';

interface PlayerInfo {
  name: string;
  elo: number;
  avatar?: string;
  isBot?: boolean;
}

interface ChessBoardProps {
  game: any; // chess.js instance
  onMove: (from: string, to: string) => boolean; // returns true if move was valid
  playerTop?: PlayerInfo;
  playerBottom?: PlayerInfo;
  orientation?: 'white' | 'black';
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
}

// SVG URLs for pieces
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

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  game, 
  onMove, 
  playerTop, 
  playerBottom,
  orientation = 'white',
  whiteTime,
  blackTime
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]); // Pieces captured BY White (so Black pieces)
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]); // Pieces captured BY Black (so White pieces)

  // Get current board state (8x8 array of {square, type, color} | null)
  const board = game.board();

  // Update captured pieces whenever the game updates
  useEffect(() => {
    // We recalculate captured pieces by replaying history or checking material difference
    // Using history is safer for sequence
    const history = game.history({ verbose: true });
    const w: string[] = []; // Captured by White (Black pieces)
    const b: string[] = []; // Captured by Black (White pieces)
    
    history.forEach((move: any) => {
      if (move.captured) {
        if (move.color === 'w') {
          // White made the move and captured something -> It was a black piece
          w.push('b' + move.captured.toUpperCase());
        } else {
          // Black made the move and captured something -> It was a white piece
          b.push('w' + move.captured.toUpperCase());
        }
      }
    });
    setCapturedWhite(w);
    setCapturedBlack(b);
  }, [game, game.fen()]);

  const handleSquareClick = (square: string) => {
    // If a square is already selected, try to move
    if (selectedSquare) {
      const moveResult = onMove(selectedSquare, square);
      if (moveResult) {
        // Move successful
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    // If not a move, select the piece if it belongs to the active player (simple check)
    const piece = game.get(square);
    if (piece) {
      // Basic validation: can only select own pieces
      const turn = game.turn();
      if (piece.color === turn) {
        setSelectedSquare(square);
        // Get legal moves for this piece
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map((m: any) => m.to));
        return;
      }
    } 
    
    // Deselect if clicking empty square or enemy piece (without moving there)
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const PlayerCard = ({ player, isTop, time, captured }: { player?: PlayerInfo, isTop: boolean, time: number, captured: string[] }) => {
    if (!player) return <div className="h-20"></div>; // Placeholder
    
    // Sort captured pieces by value: P, N, B, R, Q
    const order = ['P', 'N', 'B', 'R', 'Q'];
    const sortedCaptured = [...captured].sort((a, b) => {
      const typeA = a.charAt(1);
      const typeB = b.charAt(1);
      return order.indexOf(typeA) - order.indexOf(typeB);
    });

    return (
      <div className={`flex items-center space-x-3 px-2 py-4 ${isTop ? 'mb-2' : 'mt-2'}`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-200 dark:border-slate-600 shrink-0 ${player.isBot ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
          {player.avatar || (player.name ? player.name.charAt(0) : '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
             <span className="font-bold text-slate-800 dark:text-white text-base truncate">{player.name}</span>
             {player.isBot && <span className="text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-slate-500 ml-2">BOT</span>}
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">{player.elo}</span>
             {!player.isBot && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
          </div>
          
          {/* Captured Pieces Display - Increased Size and Spacing */}
          <div className="flex flex-wrap gap-0.5 mt-1.5 h-7">
             {sortedCaptured.map((p, i) => (
                <div key={i} className="-ml-2 first:ml-0 hover:z-10 hover:scale-125 transition-transform relative cursor-help">
                  <img src={PIECE_IMAGES[p]} className="w-7 h-7 filter drop-shadow-md" alt="" />
                </div>
             ))}
          </div>
        </div>
        
        {/* Timer */}
        <div className={`px-4 py-2 rounded-lg font-mono text-2xl font-bold shadow-sm transition-colors border-2 ${time < 30 ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 animate-pulse' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
          {formatTime(time)}
        </div>
      </div>
    );
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Determine which timer belongs to which player slot
  const topTime = orientation === 'white' ? blackTime : whiteTime;
  const bottomTime = orientation === 'white' ? whiteTime : blackTime;

  // Captured pieces mapping
  // If orientation is White (User at bottom):
  // Bottom Player (White) shows pieces captured BY White (so Black pieces) -> capturedWhite
  // Top Player (Black) shows pieces captured BY Black (so White pieces) -> capturedBlack
  const topCaptured = orientation === 'white' ? capturedBlack : capturedWhite;
  const bottomCaptured = orientation === 'white' ? capturedWhite : capturedBlack;

  return (
    <div className="w-full max-w-[600px] select-none mx-auto">
      <PlayerCard player={playerTop} isTop={true} time={topTime} captured={topCaptured} />
      
      <div className="relative aspect-square bg-slate-300 rounded-lg shadow-2xl overflow-hidden border-4 border-slate-800 dark:border-slate-600">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8">
          {board.map((row: any[], rowIndex: number) => 
            row.map((piece: any, colIndex: number) => {
              const squareName = `${files[colIndex]}${ranks[rowIndex]}`;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isPossibleMove = possibleMoves.includes(squareName);
              const pieceKey = piece ? `${piece.color}${piece.type.toUpperCase()}` : null;
              
              // Highlight last move
              const history = game.history({ verbose: true });
              const lastMove = history.length > 0 ? history[history.length - 1] : null;
              const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

              // Check indication
              const isKing = piece && piece.type === 'k';
              // FIX: Ensure piece exists before checking color to avoid "Cannot read properties of null (reading 'color')"
              const inCheck = game.inCheck() && piece && piece.color === game.turn();
              
              return (
                <div 
                  key={squareName}
                  onClick={() => handleSquareClick(squareName)}
                  className={`relative flex items-center justify-center
                    ${isDark ? 'bg-[#739552]' : 'bg-[#ebecd0]'}
                    ${isSelected ? '!bg-yellow-200/80 ring-inset ring-4 ring-yellow-400/50' : ''}
                    ${isLastMove && !isSelected ? 'after:absolute after:inset-0 after:bg-yellow-500/30' : ''}
                    ${isKing && inCheck ? 'bg-red-500/80 radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 70%)' : ''}
                  `}
                >
                  {/* Coordinates */}
                  {colIndex === 0 && (
                    <span className={`absolute top-0.5 left-0.5 text-[10px] font-bold z-0 ${isDark ? 'text-[#ebecd0]' : 'text-[#739552]'}`}>
                      {ranks[rowIndex]}
                    </span>
                  )}
                  {rowIndex === 7 && (
                    <span className={`absolute bottom-0 right-1 text-[10px] font-bold z-0 ${isDark ? 'text-[#ebecd0]' : 'text-[#739552]'}`}>
                      {files[colIndex]}
                    </span>
                  )}

                  {/* Possible Move Indicator */}
                  {isPossibleMove && (
                    <div className={`absolute z-20 ${piece ? 'ring-[6px] ring-slate-800/20 w-full h-full rounded-none' : 'w-4 h-4 bg-slate-800/20 rounded-full'}`}></div>
                  )}

                  {/* Piece */}
                  {pieceKey && (
                    <img 
                      src={PIECE_IMAGES[pieceKey]} 
                      alt={pieceKey} 
                      className="w-[85%] h-[85%] object-contain z-10 cursor-pointer hover:scale-105 transition-transform active:scale-95"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <PlayerCard player={playerBottom} isTop={false} time={bottomTime} captured={bottomCaptured} />
    </div>
  );
};
