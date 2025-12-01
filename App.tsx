
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ChessBoard } from './components/ChessBoard';
import { AuthModal } from './components/AuthModal';
import { TRANSLATIONS, MOCK_ANNOUNCEMENTS, MOCK_PLAYERS, MOCK_BOTS } from './constants';
import { Language, Theme } from './types';
import { getChessAdvice } from './services/gemini';
import { supabase } from './services/supabase';
import { Users, Cpu, Play, Flag, RefreshCw } from 'lucide-react';
// Import Chess from chess.js
import { Chess } from 'chess.js';

// --- Page Components (Internal) ---

const PlayPage = ({ lang, user }: { lang: Language, user: any }) => {
  const t = TRANSLATIONS[lang].game;
  const [mode, setMode] = useState<'online' | 'computer'>('online');
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game Logic State
  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState<string>('');
  
  // Timers (in seconds) - Default 10 minutes (600s)
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const timerRef = useRef<number | null>(null);

  // Timer Effect
  useEffect(() => {
    if (gameStarted && !game.isGameOver()) {
      timerRef.current = window.setInterval(() => {
        const turn = game.turn();
        if (turn === 'w') {
          setWhiteTime(prev => {
            if (prev <= 0) {
               setGameStatus("Black wins on time");
               return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 0) {
               setGameStatus("White wins on time");
               return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, game, gameStatus]);

  // Reset game state when switching modes or ending game
  useEffect(() => {
    if (!gameStarted) {
      const newGame = new Chess();
      setGame(newGame);
      setGameStatus('');
      setWhiteTime(600);
      setBlackTime(600);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [gameStarted]);

  // Logic to handle moves
  const onMove = (from: string, to: string) => {
    // Only allow moves if game is started (or if testing freely)
    if (mode === 'computer' && !gameStarted) return false;
    if (game.isGameOver() || (whiteTime <= 0 || blackTime <= 0)) return false;

    // Check if it's user's turn (User plays White in this simplified demo vs Bot)
    // If playing against bot, user is usually white
    if (mode === 'computer' && game.turn() !== 'w') return false;

    try {
      const move = game.move({ from, to, promotion: 'q' }); // always promote to queen for simplicity
      if (move) {
        // Update state to trigger re-render
        setGame(new Chess(game.fen()));
        checkGameOver();

        // If computer mode and game active, trigger bot move
        if (mode === 'computer' && gameStarted && !game.isGameOver()) {
          // Add a small delay for realism
          setTimeout(() => makeBotMove(selectedBot), 500);
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const getPieceValue = (pieceType: string) => {
     switch(pieceType) {
       case 'p': return 1;
       case 'n': return 3;
       case 'b': return 3;
       case 'r': return 5;
       case 'q': return 9;
       case 'k': return 0;
       default: return 0;
     }
  };

  const makeBotMove = (botProfile: any) => {
    if (game.isGameOver()) return;

    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    const elo = botProfile ? botProfile.elo : 1000;
    
    // Facteur de compétence : 
    // ELO 400 -> ~13% de chances de jouer le meilleur coup
    // ELO 3000 -> 100% de chances de jouer le meilleur coup
    const skillFactor = Math.min(1.0, Math.max(0.05, elo / 3000));
    
    // Décider si le bot joue "bien" ou "au hasard"
    const shouldPlayBestMove = Math.random() < skillFactor;

    if (shouldPlayBestMove) {
       // Fonction d'évaluation simple
       const evaluateMove = (move: any) => {
          let score = 0;
          
          // 1. Gain matériel (Captures)
          if (move.captured) {
             score += getPieceValue(move.captured) * 10;
             // On préfère capturer avec une pièce de faible valeur (ex: pion prend reine)
             score -= getPieceValue(move.piece); 
          }

          // 2. Promotion
          if (move.promotion) score += 90;

          // 3. Echec et Mat ou Echec
          if (move.san.includes('#')) score += 10000; // Mat prioritaire
          else if (move.san.includes('+')) score += 5; // Echec bon signe

          // 4. Contrôle du centre (e4, d4, e5, d5) pour l'ouverture
          const centerSquares = ['d4', 'd5', 'e4', 'e5'];
          if (centerSquares.includes(move.to)) score += 2;

          return score;
       };

       // Classer les coups par score
       const rankedMoves = possibleMoves.map((move: any) => ({
          move,
          score: evaluateMove(move)
       })).sort((a: any, b: any) => b.score - a.score);
       
       // Plus l'ELO est haut, moins on prend de risques de choisir un coup moyen
       // ELO > 2000 : Top 1 coup
       // ELO > 1500 : Top 3 coups
       // Sinon : Top 5 coups
       const topN = elo > 2000 ? 1 : elo > 1500 ? 3 : 5;
       const candidates = rankedMoves.slice(0, topN);
       const selected = candidates[Math.floor(Math.random() * candidates.length)];
       
       game.move(selected.move.san);
    } else {
       // Coup aléatoire (Erreur potentielle)
       const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
       game.move(randomMove.san);
    }

    // Mettre à jour l'état
    setGame(new Chess(game.fen()));
    checkGameOver();
  };

  const checkGameOver = () => {
    if (game.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (game.isCheckmate()) setGameStatus("Checkmate!");
      else if (game.isDraw()) setGameStatus("Draw");
      else setGameStatus("Game Over");
    }
  };

  const handleStartBotGame = () => {
     setGameStarted(true);
     setGame(new Chess()); // Reset board
     setGameStatus('');
     setWhiteTime(600);
     setBlackTime(600);
  };

  const handleResign = () => {
    setGameStarted(false);
    setGame(new Chess());
    if(mode === 'computer') setSelectedBot(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{t.title}</h2>
         {gameStatus && (
           <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow animate-pulse">
             {gameStatus}
           </div>
         )}
         {mode === 'online' && !gameStarted && (
           <div className="flex space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-500 font-medium">15,240 Players Online</span>
           </div>
         )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Chess Board */}
        <div className="lg:col-span-2 flex justify-center bg-slate-100 dark:bg-slate-800/50 p-2 lg:p-8 rounded-3xl shadow-inner min-h-[400px] lg:min-h-[500px] items-center">
          <ChessBoard 
             game={game}
             onMove={onMove}
             whiteTime={whiteTime}
             blackTime={blackTime}
             playerTop={
               gameStarted && selectedBot ? { name: selectedBot.name, elo: selectedBot.elo, avatar: selectedBot.avatar, isBot: true } 
               : gameStarted ? { name: "Opponent", elo: 1450 } 
               : undefined
             }
             playerBottom={{ 
               name: user?.email ? user.email.split('@')[0] : 'Me', 
               elo: 1200, 
               avatar: user?.email ? user.email.charAt(0).toUpperCase() : 'ME'
             }}
          />
        </div>

        {/* Right Column: Controls */}
        <div className="space-y-6">
          
          {/* Mode Switcher - Disabled when game started */}
          <div className={`bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex transition-opacity ${gameStarted ? 'opacity-50 pointer-events-none' : ''}`}>
             <button 
               onClick={() => setMode('online')}
               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${mode === 'online' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
             >
               <Users size={18} />
               <span>{t.mode_online}</span>
             </button>
             <button 
               onClick={() => setMode('computer')}
               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${mode === 'computer' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
             >
               <Cpu size={18} />
               <span>{t.mode_computer}</span>
             </button>
          </div>

          {/* Online Mode Controls */}
          {mode === 'online' && !gameStarted && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {t.select_time}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['3+2', '5+0', '10+0', '15+10', '30+0'].map(time => (
                  <button key={time} className="py-3 px-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all font-bold text-sm border border-slate-200 dark:border-slate-600">
                    {time}
                  </button>
                ))}
                <button className="py-3 px-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 font-bold text-sm">Custom</button>
              </div>
              <button className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2">
                <Play size={20} fill="currentColor" />
                <span>{t.start}</span>
              </button>
            </div>
          )}

          {/* Computer Mode Selection (Only if game NOT started) */}
          {mode === 'computer' && !gameStarted && (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in space-y-4">
                <h3 className="font-semibold text-lg">{t.bot_select}</h3>
                
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {MOCK_BOTS.map(bot => (
                    <div 
                      key={bot.id} 
                      onClick={() => setSelectedBot(bot)}
                      className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all group ${selectedBot?.id === bot.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-700/50'}`}
                    >
                       <div className="flex items-center space-x-3">
                         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bot.color} flex items-center justify-center text-2xl shadow-sm`}>
                            {bot.avatar}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-800 dark:text-white">{bot.name}</span>
                              <span className="font-mono text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">{bot.elo}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{bot.description}</p>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>

                <button 
                  disabled={!selectedBot}
                  onClick={handleStartBotGame}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                   <Cpu size={20} />
                   <span>{t.start_bot}</span>
                </button>
             </div>
          )}

          {/* Active Game Controls (Visible when gameStarted is TRUE) */}
          {gameStarted && (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                   <h3 className="font-bold text-lg flex items-center">
                     <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                     {t.game_active}
                   </h3>
                </div>

                {/* Move History */}
                <div className="h-64 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 overflow-y-auto font-mono text-sm custom-scrollbar border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-6 gap-2 text-slate-500 dark:text-slate-400">
                        {game.history().reduce((acc: any[], move: string, i: number) => {
                          if (i % 2 === 0) {
                             acc.push(
                               <React.Fragment key={i}>
                                  <span className="col-span-1 text-slate-400">{(i/2)+1}.</span>
                                  <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{move}</span>
                               </React.Fragment>
                             );
                          } else {
                             acc[acc.length - 1] = (
                               <React.Fragment key={i}>
                                  {acc[acc.length - 1]}
                                  <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{move}</span>
                                  <span className="col-span-1"></span>
                               </React.Fragment>
                             );
                          }
                          return acc;
                        }, [])}
                    </div>
                </div>

                <div className="flex space-x-3">
                   <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2">
                      <RefreshCw size={16} />
                      <span>{t.draw}</span>
                   </button>
                   <button 
                     onClick={handleResign} 
                     className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center space-x-2"
                   >
                      <Flag size={16} />
                      <span>{t.resign}</span>
                   </button>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

const RankingPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-end">
      <h2 className="text-3xl font-bold">Global Rankings</h2>
      <div className="flex space-x-2">
        <select className="bg-white dark:bg-slate-800 border-none rounded-lg p-2 text-sm shadow-sm"><option>Standard</option><option>Blitz</option><option>Bullet</option></select>
        <select className="bg-white dark:bg-slate-800 border-none rounded-lg p-2 text-sm shadow-sm"><option>World</option><option>Europe</option><option>Americas</option><option>Asia</option></select>
      </div>
    </div>

    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="p-5 font-semibold">Rank</th>
            <th className="p-5 font-semibold">Player</th>
            <th className="p-5 font-semibold">Club</th>
            <th className="p-5 font-semibold">Elo</th>
            <th className="p-5 font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {MOCK_PLAYERS.map((p, i) => (
            <tr key={p.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group cursor-pointer">
              <td className="p-5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-500'}`}>
                  {i + 1}
                </div>
              </td>
              <td className="p-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{p.name}</span>
                </div>
              </td>
              <td className="p-5 text-sm text-slate-500">{p.club}</td>
              <td className="p-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.elo}</td>
              <td className="p-5 text-green-500 text-sm font-medium">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ▲ {Math.floor(Math.random() * 20)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TrainingPage = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang].training;
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskCoach = async () => {
    setLoading(true);
    // Hardcoded FEN for demo purpose
    const demoFen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
    const res = await getChessAdvice(demoFen, "What should I play in this Ruy Lopez opening?");
    setAdvice(res || "Coach is currently reviewing another game. Try again.");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{t.title}</h2>
        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Premium</span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[80px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-1000"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 flex items-center">
              {t.ai_coach} 
              <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded border border-white/20">PRO</span>
            </h3>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Analyze your games, ask for strategic advice, and understand your mistakes with the power of our AI engine.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={handleAskCoach}
                disabled={loading}
                className="w-full py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                   <><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing...</>
                ) : (
                   <><span>✨</span><span>{t.ask_coach}</span></>
                )}
              </button>
            </div>
            
            {advice && (
              <div className="mt-8 p-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 animate-fade-in-up">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Coach Advice</h4>
                    <p className="text-sm text-indigo-100 italic leading-relaxed">"{advice}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-xl mb-6">Learning Path</h3>
           <div className="space-y-4">
             {['Rook Endgames', 'Mastering King\'s Indian Defense', 'Tactics for Beginners', 'Chess Psychology'].map((course, i) => (
               <div key={i} className="flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 </div>
                 <div className="flex-1">
                   <h4 className="font-semibold text-slate-800 dark:text-slate-200">{course}</h4>
                   <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                     <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${(4-i)*20}%`}}></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState('play');
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('app');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('app');
        setIsAuthModalOpen(false); // Close modal on success
      } else {
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  if (view === 'landing') {
    return (
      <>
        <LandingPage 
          onLoginClick={handleLoginClick}
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          lang={lang} 
        />
      </>
    );
  }

  // Application Layout Logic
  const renderPage = () => {
    switch(currentPage) {
      case 'play': return <PlayPage lang={lang} user={user} />;
      case 'ranking': return <RankingPage />;
      case 'training': return <TrainingPage lang={lang} />;
      case 'news': return (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold">News & Announcements</h2>
          <div className="grid gap-6">
            {MOCK_ANNOUNCEMENTS.map(ann => (
              <div key={ann.id} className={`p-6 rounded-2xl shadow-lg border-l-4 ${ann.pinned ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${ann.category === 'tournament' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{ann.category}</span>
                  <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{ann.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-fade-in">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-light">Loading module {currentPage}...</p>
        </div>
      );
    }
  };

  return (
    <Layout 
      currentLang={lang} 
      setLang={setLang} 
      theme={theme} 
      toggleTheme={toggleTheme}
      currentPage={currentPage}
      setPage={setCurrentPage}
      user={user}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
