
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ChessBoard } from './components/ChessBoard';
import { AuthModal } from './components/AuthModal';
import { TRANSLATIONS, MOCK_BOTS } from './constants';
import { Language, Theme, UserProfile } from './types';
import { supabase, getTournaments, getAllProfiles } from './services/supabase';
import { 
  Users, Trophy, Loader2, Plus, Trash2, Edit3, Swords, Shield, Search, ChevronRight, MoreVertical, CheckCircle, X, Calendar, MapPin, Activity
} from 'lucide-react';
import { Chess } from 'chess.js';

// --- Modal Universel (Corrected CSS to fix top gap) ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Overlay noir complet avec top:0 explicite */}
            <div 
              className="fixed top-0 left-0 w-full h-full bg-slate-950/80 backdrop-blur-md transition-opacity" 
              onClick={onClose}
            ></div>
            
            {/* Boîte de dialogue */}
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

// --- Liste des Tournois avec vérification d'inscription ---
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
        // Recharger le compte d'inscrits
        fetchData();
    } else {
        alert("Erreur lors de l'inscription. Peut-être êtes-vous déjà inscrit ?");
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
              <h2 className="text-4xl font-black tracking-tighter">Tournois</h2>
              <p className="text-slate-500 font-bold">Défiez les meilleurs joueurs de la plateforme.</p>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">Aucun tournoi n'est prévu pour le moment.</div>
        ) : tournaments.map(t => {
          const isRegistered = registeredIds.includes(t.id);
          return (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-3xl ${t.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-10 transition-transform group-hover:scale-110`}>
                    <Trophy size={32}/>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{t.status}</span>
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
        } catch (err: any) {
            alert("Erreur lors de l'enregistrement : " + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Confirmer la suppression définitive du tournoi ?")) {
            const { error } = await supabase.from('tournaments').delete().eq('id', id);
            if (!error) fetchData();
            else alert("Erreur lors de la suppression.");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter">Administration</h2>
                    <p className="text-slate-500 font-bold">Gérez les membres et les compétitions ChessNetra.</p>
                </div>
                <button onClick={() => { setSelectedT(null); setFormOpen(true); }} className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform hover:bg-blue-700">
                    <Plus size={20}/> <span>Ajouter un Tournoi</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                            <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Événements programmés</h4>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {tournaments.map((t) => (
                                <div key={t.id} className="p-8 flex flex-col sm:flex-row justify-between items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center space-x-4 w-full">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center font-black text-blue-600 shrink-0">{t.name.charAt(0).toUpperCase()}</div>
                                        <div className="min-w-0">
                                            <p className="font-black truncate">{t.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{new Date(t.start_date).toLocaleDateString()} • {t.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 shrink-0">
                                        <button onClick={() => { setSelectedT(t); setFormOpen(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Modifier"><Edit3 size={18}/></button>
                                        <button onClick={() => handleDelete(t.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Supprimer"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[40px] p-8 text-white h-fit shadow-2xl">
                    <Shield size={48} className="mb-6 text-blue-500"/>
                    <h4 className="text-2xl font-black mb-4 tracking-tight">Privilèges Admin</h4>
                    <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">Vous contrôlez l'organisation globale. Les modifications sont appliquées en temps réel pour tous les utilisateurs.</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Membres Actifs</p>
                                <p className="text-3xl font-black">{users.length}</p>
                            </div>
                            <Users size={32} className="opacity-20"/>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={selectedT ? "Modifier l'événement" : "Nouveau Tournoi"}>
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Nom du tournoi</label>
                        <input name="name" defaultValue={selectedT?.name} placeholder="Ex: Grand Slam Kinshasa" required className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 ml-1">Date et Heure</label>
                            <input name="start_date" type="datetime-local" defaultValue={selectedT?.start_date ? new Date(selectedT.start_date).toISOString().slice(0, 16) : ''} required className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 ml-1">Capacité Max</label>
                            <input name="max_players" type="number" defaultValue={selectedT?.max_players || 100} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Informations complémentaires</label>
                        <textarea name="description" placeholder="Détails du tournoi, règles, prix..." defaultValue={selectedT?.description} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold h-32 resize-none" />
                    </div>
                    <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700">
                        {selectedT ? "Appliquer les changements" : "Créer le tournoi"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

// --- Arène de jeu principale ---
const Arena = ({ userProfile }: { userProfile: any }) => {
    const [game, setGame] = useState(new Chess());
    const [activeGame, setActiveGame] = useState<any>(null);
    const [mode, setMode] = useState<'online' | 'bot'>('online');
    const [time, setTime] = useState(10);

    const startGame = () => {
        const opponent = mode === 'bot' ? { name: MOCK_BOTS[0].name, elo: MOCK_BOTS[0].elo } : { name: 'Champion_X', elo: 1420 };
        const newGame = new Chess();
        setGame(newGame);
        setActiveGame({ 
          fen: newGame.fen(), 
          opponent, 
          whiteTime: time * 60, 
          blackTime: time * 60,
          mode
        });
    };

    const handleMove = (from: string, to: string) => {
        try {
            const temp = new Chess(game.fen());
            const move = temp.move({ from, to, promotion: 'q' });
            if (move) {
                setGame(temp);
                if (mode === 'bot' && !temp.isGameOver() && temp.turn() === 'b') {
                    setTimeout(() => {
                        const botMoves = temp.moves();
                        if (botMoves.length > 0) {
                            const randomMove = botMoves[Math.floor(Math.random() * botMoves.length)];
                            temp.move(randomMove);
                            setGame(new Chess(temp.fen()));
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
                playerBottom={{ name: userProfile?.username || 'Joueur', elo: userProfile?.elo_rapid || 1200 }}
                whiteTime={activeGame.whiteTime}
                blackTime={activeGame.blackTime}
                onTimeOut={(winner) => {
                    alert(`${winner === 'white' ? 'Le temps est écoulé pour les Noirs ! Les Blancs gagnent.' : 'Le temps est écoulé pour les Blancs ! Les Noirs gagnent.'}`);
                    setActiveGame(null);
                }}
                onExit={() => setActiveGame(null)}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in pb-20">
            <div className="bg-white dark:bg-slate-900 p-10 lg:p-14 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex p-2 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-12">
                    <button onClick={() => setMode('online')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'online' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>Partie Rapide</button>
                    <button onClick={() => setMode('bot')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'bot' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}>Vs IA</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Sélectionner la cadence</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 3, 5, 10, 30, 60].map(m => (
                                <button key={m} onClick={() => setTime(m)} className={`py-3 rounded-xl border font-black text-sm transition-all ${time === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                    {m} min
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {time <= 2 ? "Bullet" : time <= 5 ? "Blitz" : "Rapide / Standard"}
                        </p>
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
       {currentPage === 'profile' && userProfile && (
           <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 text-center animate-fade-in shadow-sm">
               <div className="w-32 h-32 bg-blue-600 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-5xl text-white font-black overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                   {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : userProfile.username?.charAt(0).toUpperCase()}
               </div>
               <h2 className="text-4xl font-black mb-2 tracking-tighter">{userProfile.username}</h2>
               <p className="text-blue-600 font-black text-xl mb-10">{userProfile.elo_rapid} ELO</p>
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-10 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Niveau d'accès</p>
                  <p className="font-bold text-blue-600 uppercase tracking-widest text-sm">{userProfile.role}</p>
               </div>
               <button onClick={() => alert("Fonctionnalité d'édition bientôt disponible.")} className="w-full py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-blue-600 hover:text-white transition-all">
                   <Edit3 size={18}/> <span>Éditer Profil</span>
               </button>
           </div>
       )}
    </Layout>
  );
};

export default App;
