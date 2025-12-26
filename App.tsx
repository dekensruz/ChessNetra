
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ChessBoard } from './components/ChessBoard';
import { AuthModal } from './components/AuthModal';
import { TRANSLATIONS, MOCK_BOTS } from './constants';
import { Language, Theme, UserProfile } from './types';
import { supabase, getTournaments, getAllProfiles } from './services/supabase';
import { 
  Users, Trophy, Loader2, Plus, Trash2, Edit3, Swords, Shield, Search, ChevronRight, MoreVertical, CheckCircle, X, Calendar, MapPin, Activity, Clock
} from 'lucide-react';
import { Chess } from 'chess.js';

// --- Modal Universel ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div 
              className="fixed top-0 left-0 w-full h-full bg-slate-950/80 backdrop-blur-md transition-opacity" 
              onClick={onClose}
            ></div>
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-3xl overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-2xl font-black tracking-tighter">{title}</h3>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X/></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
            </div>
        </div>
    );
};

// --- Helper: Calcul Temps Restant ---
const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return days > 0 ? `Dans ${days}j ${hours}h` : `Dans ${hours}h ${mins}m`;
};

// --- Liste des Tournois ---
const TournamentList = ({ userProfile }: { userProfile: any }) => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const tData = await getTournaments();
        setTournaments(tData);
        
        if (userProfile) {
            const { data } = await supabase.from('tournament_registrations').select('tournament_id').eq('player_id', userProfile.id);
            if (data) setRegisteredIds(data.map(r => r.tournament_id));
        }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = async (id: string) => {
    if (!userProfile) return alert("Veuillez vous connecter pour vous inscrire.");
    if (registeredIds.includes(id)) return;
    
    setLoading(true);
    const { error } = await supabase.from('tournament_registrations').insert({ tournament_id: id, player_id: userProfile.id });
    if (!error) {
        setRegisteredIds(prev => [...prev, id]);
        fetchData();
    } else {
        alert("Erreur lors de l'inscription.");
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
              <h2 className="text-4xl font-black tracking-tighter">Tournois</h2>
              <p className="text-slate-500 font-bold">Inscrivez-vous pour gagner des points ELO.</p>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(t => {
          const isRegistered = registeredIds.includes(t.id);
          const countdown = getCountdown(t.start_date);
          return (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-3xl ${t.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-10 transition-transform group-hover:scale-110`}>
                    <Trophy size={32}/>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{t.status}</span>
                    {countdown && t.status !== 'finished' && <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center"><Clock size={10} className="mr-1"/> {countdown}</span>}
                </div>
              </div>
              <h3 className="text-xl font-black mb-1 truncate group-hover:text-blue-600 transition-colors">{t.name}</h3>
              <p className="text-slate-500 font-bold text-sm mb-6">{t.category} • {t.registered_count} inscrits</p>
              
              <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                 <Calendar size={12} className="mr-2" /> {new Date(t.start_date).toLocaleDateString()}
              </div>

              <button 
                onClick={() => handleRegister(t.id)}
                disabled={isRegistered}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${isRegistered ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-blue-600 active:scale-95'}`}
              >
                {isRegistered ? <><CheckCircle size={16}/> <span>Inscrit</span></> : <><span>S'inscrire</span> <ChevronRight size={14} /></>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Console Administration ---
const AdminConsole = ({ userProfile }: { userProfile: any }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedT, setSelectedT] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, t] = await Promise.all([getAllProfiles(), getTournaments()]);
            setUsers(p);
            setTournaments(t);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            if (selectedT) {
                const { error } = await supabase.from('tournaments').update(data).eq('id', selectedT.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('tournaments').insert({ ...data, organizer_id: userProfile.id });
                if (error) throw error;
            }
            setFormOpen(false);
            fetchData();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Supprimer le tournoi ?")) {
            const { error } = await supabase.from('tournaments').delete().eq('id', id);
            if (!error) fetchData();
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter">Admin</h2>
                <button onClick={() => { setSelectedT(null); setFormOpen(true); }} className="px-6 py-4 bg-blue-600 text-white rounded-[24px] font-black flex items-center space-x-2 shadow-xl shadow-blue-500/20">
                    <Plus size={20}/> <span>Nouveau</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {tournaments.map((t) => (
                        <div key={t.id} className="p-8 flex justify-between items-center">
                            <div>
                                <p className="font-black">{t.name}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">{new Date(t.start_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => { setSelectedT(t); setFormOpen(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={18}/></button>
                                <button onClick={() => handleDelete(t.id)} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={selectedT ? "Modifier" : "Nouveau"}>
                <form onSubmit={handleSave} className="space-y-6">
                    <input name="name" defaultValue={selectedT?.name} placeholder="Nom" required className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold" />
                    <input name="start_date" type="datetime-local" defaultValue={selectedT?.start_date ? new Date(selectedT.start_date).toISOString().slice(0, 16) : ''} required className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold" />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Enregistrer</button>
                </form>
            </Modal>
        </div>
    );
};

// --- Arène de jeu ---
const Arena = ({ userProfile }: { userProfile: any }) => {
    const [game, setGame] = useState(new Chess());
    const [activeGame, setActiveGame] = useState<any>(null);
    const [mode, setMode] = useState<'online' | 'bot'>('online');
    const [time, setTime] = useState(10);
    const [bot, setBot] = useState(MOCK_BOTS[0]);

    // Sauvegarde et Chargement Local
    useEffect(() => {
        const saved = localStorage.getItem('chess_game_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const loadedGame = new Chess(parsed.fen);
                setGame(loadedGame);
                setActiveGame(parsed.config);
            } catch (e) { localStorage.removeItem('chess_game_save'); }
        }
    }, []);

    const saveGameLocally = (fen: string, config: any) => {
        localStorage.setItem('chess_game_save', JSON.stringify({ fen, config }));
    };

    const startGame = () => {
        const opponent = mode === 'bot' ? { name: bot.name, elo: bot.elo, avatar: bot.avatar } : { name: 'Champion_X', elo: 1420 };
        const newGame = new Chess();
        const config = { opponent, whiteTime: time * 60, blackTime: time * 60, mode, botLevel: bot.level };
        setGame(newGame);
        setActiveGame(config);
        saveGameLocally(newGame.fen(), config);
    };

    const handleMove = (from: string, to: string) => {
        try {
            const temp = new Chess(game.fen());
            const move = temp.move({ from, to, promotion: 'q' });
            if (move) {
                setGame(temp);
                saveGameLocally(temp.fen(), activeGame);

                if (activeGame.mode === 'bot' && !temp.isGameOver() && temp.turn() === 'b') {
                    // IA Améliorée : Priorise les captures de pièces de valeur
                    setTimeout(() => {
                        const botMoves = temp.moves({ verbose: true });
                        if (botMoves.length > 0) {
                            // IA Simple heuristique : capturer la pièce la plus chère
                            const pieceValues: any = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
                            botMoves.sort((a, b) => {
                                const valA = a.captured ? pieceValues[a.captured] : 0;
                                const valB = b.captured ? pieceValues[b.captured] : 0;
                                return valB - valA;
                            });
                            
                            // Probabilité d'erreur selon le niveau
                            let chosenMove = botMoves[0];
                            if (activeGame.botLevel === 'easy' && Math.random() > 0.4) {
                                chosenMove = botMoves[Math.floor(Math.random() * botMoves.length)];
                            } else if (activeGame.botLevel === 'medium' && Math.random() > 0.8) {
                                chosenMove = botMoves[Math.floor(Math.random() * botMoves.length)];
                            }

                            temp.move(chosenMove);
                            setGame(new Chess(temp.fen()));
                            saveGameLocally(temp.fen(), activeGame);
                        }
                    }, 1200);
                }
                return true;
            }
        } catch (e) { return false; }
        return false;
    };

    if (activeGame) {
        return (
            <ChessBoard 
                game={game} 
                onMove={handleMove} 
                playerTop={activeGame.opponent}
                playerBottom={{ name: userProfile?.username || 'Joueur', elo: userProfile?.elo_rapid || 1200 }}
                whiteTime={activeGame.whiteTime}
                blackTime={activeGame.blackTime}
                onTimeOut={(winner) => {
                    alert(`${winner === 'white' ? 'Le temps est écoulé ! Les Blancs gagnent.' : 'Le temps est écoulé ! Les Noirs gagnent.'}`);
                    setActiveGame(null);
                    localStorage.removeItem('chess_game_save');
                }}
                onExit={() => {
                    setActiveGame(null);
                    localStorage.removeItem('chess_game_save');
                }}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 animate-fade-in pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex p-2 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-12">
                        <button onClick={() => setMode('online')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'online' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>En Ligne</button>
                        <button onClick={() => setMode('bot')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'bot' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>Contre Bot</button>
                    </div>
                    <div className="space-y-12">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Sélectionner la cadence</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 3, 5, 10, 30, 60].map(m => (
                                    <button key={m} onClick={() => setTime(m)} className={`py-4 rounded-2xl border font-black text-sm transition-all ${time === m ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                        {m} min
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={startGame} className="w-full py-8 bg-blue-600 text-white rounded-[40px] shadow-3xl flex flex-col items-center justify-center transform active:scale-95 transition-all group hover:bg-blue-700">
                            <Swords size={48} className="mb-4 group-hover:rotate-12 transition-transform" />
                            <span className="text-3xl font-black tracking-tighter uppercase">Lancer la partie</span>
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Choisir un Bot</h4>
                    {MOCK_BOTS.map(b => (
                        <div 
                            key={b.id} 
                            onClick={() => { setBot(b); setMode('bot'); }}
                            className={`p-6 rounded-[32px] cursor-pointer border transition-all ${bot.id === b.id && mode === 'bot' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500/50'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-4xl">{b.avatar}</span>
                                <div className="min-w-0">
                                    <p className="font-black truncate">{b.name}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${bot.id === b.id && mode === 'bot' ? 'text-blue-100' : 'text-blue-600'}`}>{b.elo} ELO</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ClubsComingSoon = () => (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="w-32 h-32 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-amber-500/10">
            <Users size={64} />
        </div>
        <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Clubs ChessNetra</h2>
        <p className="text-xl text-slate-500 font-bold mb-10">Une nouvelle façon de vivre les échecs en équipe. Bientôt disponible en RDC.</p>
        <div className="inline-block px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-950 rounded-full font-black text-xs uppercase tracking-widest">
            À venir prochainement
        </div>
    </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  const [currentPage, setPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) setUserProfile(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) { fetchProfile(session.user.id); setPage('play'); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { fetchProfile(session.user.id); setPage('play'); }
      else { setUserProfile(null); setPage('home'); }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  if (!user && (currentPage === 'home' || currentPage === 'auth')) {
    return (
      <>
        <LandingPage onLoginClick={() => setPage('auth')} lang={lang} setLang={setLang} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
        {currentPage === 'auth' && <AuthModal isOpen={true} onClose={() => setPage('home')} lang={lang} />}
      </>
    );
  }

  return (
    <Layout currentLang={lang} setLang={setLang} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} currentPage={currentPage} setPage={setPage} user={user} userProfile={userProfile}>
       {currentPage === 'play' && <Arena userProfile={userProfile} />}
       {currentPage === 'tournaments' && <TournamentList userProfile={userProfile} />}
       {currentPage === 'admin' && <AdminConsole userProfile={userProfile} />}
       {currentPage === 'clubs' && <ClubsComingSoon />}
       {currentPage === 'profile' && userProfile && (
           <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 text-center animate-fade-in shadow-sm">
               <div className="w-32 h-32 bg-blue-600 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-5xl text-white font-black overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                   {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : userProfile.username?.charAt(0).toUpperCase()}
               </div>
               <h2 className="text-4xl font-black mb-2 tracking-tighter">{userProfile.username}</h2>
               <p className="text-blue-600 font-black text-xl mb-10">{userProfile.elo_rapid} ELO</p>
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-10 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Statut Membre</p>
                  <p className="font-bold text-blue-600 uppercase tracking-widest text-sm">{userProfile.role}</p>
               </div>
               <button onClick={() => alert("Edition bientôt active.")} className="w-full py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-blue-600 hover:text-white transition-all">
                   <Edit3 size={18}/> <span>Éditer Profil</span>
               </button>
           </div>
       )}
    </Layout>
  );
};

export default App;
