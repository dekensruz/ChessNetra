
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ChessBoard } from './components/ChessBoard';
import { AuthModal } from './components/AuthModal';
import { TRANSLATIONS, MOCK_BOTS } from './constants';
import { Language, Theme, UserProfile } from './types';
import { supabase, getTournaments, getAllProfiles } from './services/supabase';
import { 
  Users, Trophy, Loader2, Plus, Trash2, Edit3, Swords, Shield, Search, ChevronRight, MoreVertical, CheckCircle
} from 'lucide-react';
import { Chess } from 'chess.js';

// --- Composants Internes ---

const TournamentList = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (id: string) => {
    if (registeredIds.includes(id)) return;
    setRegisteredIds(prev => [...prev, id]);
    alert("Inscription réussie !");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
              <h2 className="text-4xl font-black tracking-tighter">Tournois</h2>
              <p className="text-slate-500 font-bold">Rejoignez la compétition officielle.</p>
          </div>
          <div className="flex space-x-2">
              <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest">Ouverts</button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Inscriptions</button>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length > 0 ? tournaments.map(t => {
          const isRegistered = registeredIds.includes(t.id);
          return (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-3xl ${t.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-10`}>
                    <Trophy size={32}/>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{t.status}</span>
              </div>
              <h3 className="text-xl font-black mb-1 truncate">{t.name}</h3>
              <p className="text-slate-500 font-bold text-sm mb-6">{t.category} • {t.registered_count + (isRegistered ? 1 : 0)}/{t.max_players} joueurs</p>
              <button 
                onClick={() => handleRegister(t.id)}
                disabled={isRegistered}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${isRegistered ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-blue-600'}`}
              >
                {isRegistered ? <><CheckCircle size={16}/> <span>Inscrit</span></> : <><span>S'inscrire</span> <ChevronRight size={14} /></>}
              </button>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">Aucun tournoi planifié pour le moment.</div>
        )}
      </div>
    </div>
  );
};

const AdminConsole = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAllProfiles(), getTournaments()])
            .then(([p, t]) => {
                setUsers(p);
                setTournaments(t);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = (type: string, id: string) => {
        alert(`Modification de ${type} (ID: ${id}) - Cette fonctionnalité nécessite des droits étendus.`);
    };

    const handleDelete = (type: string, id: string) => {
        if(confirm(`Supprimer ce ${type} ?`)) {
            alert(`Suppression de ${id} simulée.`);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter">Console Admin</h2>
                    <p className="text-slate-500 font-bold italic">"Gérez l'écosystème ChessNetra en temps réel."</p>
                </div>
                <button onClick={() => handleEdit('tournoi', 'new')} className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">
                    <Plus size={20}/> <span>Nouveau Tournoi</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-black text-sm uppercase tracking-widest">Tournois</h4>
                            <Search size={18} className="text-slate-400 cursor-pointer"/>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                            {tournaments.map((t, i) => (
                                <div key={i} className="p-6 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black">{t.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-black">{t.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{new Date(t.start_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit('tournoi', t.id)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit3 size={18}/></button>
                                        <button onClick={() => handleDelete('tournoi', t.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-black text-sm uppercase tracking-widest">Membres ({users.length})</h4>
                            <Users size={18} className="text-slate-400"/>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                            {users.map((u, i) => (
                                <div key={i} className="p-6 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center font-black text-blue-600 text-xs">
                                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover rounded-xl"/> : u.username?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{u.username}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{u.elo_rapid} ELO • {u.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleEdit('utilisateur', u.id)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-600 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl h-fit lg:sticky lg:top-8">
                    <div>
                        <Shield size={48} className="mb-6 opacity-40"/>
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Rôles & Sécurité</h4>
                        <p className="text-blue-100 text-sm font-bold leading-relaxed">Les administrateurs peuvent valider les tournois, modérer le chat et gérer les sanctions.</p>
                    </div>
                    <div className="mt-12 space-y-4">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Total Joueurs</p>
                            <p className="text-2xl font-black">{users.length}</p>
                        </div>
                        <button className="w-full py-4 bg-white text-blue-600 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors">
                            Journal d'audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Arena = ({ userProfile }: { userProfile: any }) => {
    const [game, setGame] = useState(new Chess());
    const [activeGame, setActiveGame] = useState<any>(null);
    const [mode, setMode] = useState<'online' | 'bot'>('online');
    const [bot, setBot] = useState(MOCK_BOTS[0]);
    const [time, setTime] = useState(10);

    useEffect(() => {
        const saved = localStorage.getItem('chess_netra_v2_save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setGame(new Chess(data.fen));
                setActiveGame(data);
            } catch (e) { localStorage.removeItem('chess_netra_v2_save'); }
        }
    }, []);

    const startGame = () => {
        const opponent = mode === 'bot' ? { name: bot.name, elo: bot.elo } : { name: 'Adversaire_En_Ligne', elo: 1350 };
        const newGame = new Chess();
        setGame(newGame);
        setActiveGame({ 
          fen: newGame.fen(), 
          opponent, 
          whiteTime: time * 60, 
          blackTime: time * 60,
          mode
        });
        localStorage.setItem('chess_netra_v2_save', JSON.stringify({ fen: newGame.fen(), opponent, whiteTime: time*60, blackTime: time*60, mode }));
    };

    const handleMove = (from: string, to: string) => {
        try {
            const move = game.move({ from, to, promotion: 'q' });
            if (move) {
                const updatedGame = new Chess(game.fen());
                setGame(updatedGame);
                
                if (mode === 'bot' && !updatedGame.isGameOver() && updatedGame.turn() === 'b') {
                    setTimeout(() => {
                        const botMoves = updatedGame.moves();
                        if (botMoves.length > 0) {
                            const randomMove = botMoves[Math.floor(Math.random() * botMoves.length)];
                            updatedGame.move(randomMove);
                            setGame(new Chess(updatedGame.fen()));
                        }
                    }, 800);
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
                playerBottom={{ name: userProfile?.username || 'Invité', elo: userProfile?.elo_rapid || 1200 }}
                whiteTime={activeGame.whiteTime}
                blackTime={activeGame.blackTime}
                onTimeOut={(winner) => {
                    alert(`Temps écoulé ! ${winner === 'white' ? 'Les blancs' : 'Les noirs'} ont gagné.`);
                    setActiveGame(null);
                    localStorage.removeItem('chess_netra_v2_save');
                }}
                onExit={() => {
                    setActiveGame(null);
                    localStorage.removeItem('chess_netra_v2_save');
                }}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex p-2 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-12 border border-slate-100 dark:border-slate-700">
                    <button onClick={() => setMode('online')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'online' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>En Ligne</button>
                    <button onClick={() => setMode('bot')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'bot' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>Ordinateur</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-10">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Cadence de jeu</label>
                            <div className="flex items-center space-x-6">
                                <input type="range" min="1" max="60" value={time} onChange={e => setTime(parseInt(e.target.value))} className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                <span className="text-4xl font-black text-blue-600">{time}m</span>
                            </div>
                        </div>
                        {mode === 'bot' && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Choisir un Bot</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {MOCK_BOTS.slice(0, 3).map(b => (
                                        <button key={b.id} onClick={() => setBot(b)} className={`p-4 rounded-2xl border text-center transition-all ${bot.id === b.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                            <div className="text-2xl mb-1">{b.avatar}</div>
                                            <div className="text-[9px] font-black uppercase tracking-tighter">{b.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={startGame} className="h-full py-16 lg:py-24 bg-blue-600 text-white rounded-[48px] shadow-3xl flex flex-col items-center justify-center transform active:scale-95 transition-all group hover:bg-blue-700">
                        <Swords size={64} className="mb-6 group-hover:rotate-12 transition-transform" />
                        <span className="text-4xl font-black tracking-tighter uppercase">Jouer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    } catch (e) { console.error("Profile Error", e); }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

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
       {currentPage === 'tournaments' && <TournamentList />}
       {currentPage === 'admin' && <AdminConsole />}
       {currentPage === 'profile' && userProfile && (
           <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 text-center animate-fade-in shadow-sm">
               <div className="w-32 h-32 bg-blue-600 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-5xl text-white font-black overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                   {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : userProfile.username?.charAt(0).toUpperCase()}
               </div>
               <h2 className="text-4xl font-black mb-2 tracking-tighter">{userProfile.username}</h2>
               <p className="text-blue-600 font-black text-xl mb-10">{userProfile.elo_rapid} ELO</p>
               <button onClick={() => alert("Edition de profil")} className="w-full py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-blue-600 hover:text-white transition-all">
                   <Edit3 size={18}/> <span>Modifier Profil</span>
               </button>
           </div>
       )}
    </Layout>
  );
};

export default App;
