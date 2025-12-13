
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ChessBoard } from './components/ChessBoard';
import { AuthModal } from './components/AuthModal';
import { TRANSLATIONS, MOCK_ANNOUNCEMENTS, MOCK_PLAYERS, MOCK_BOTS, MOCK_TOURNAMENTS } from './constants';
import { Language, Theme, UserProfile, Tournament } from './types';
import { getChessAdvice } from './services/gemini';
import { supabase } from './services/supabase';
import { Users, Cpu, Play, Flag, RefreshCw, Clock, Lock, Unlock, AlertTriangle, CheckCircle, Shield, X, Filter, Plus, Calendar, Trophy, Loader2 } from 'lucide-react';
import { Chess } from 'chess.js';

// --- Helper Components ---

// 1. ADMIN DASHBOARD (Responsive & Functional)
interface AdminDashboardProps {
    userProfile: UserProfile;
    allowUnpaid: boolean;
    setAllowUnpaid: (v: boolean) => void;
    tournaments: Tournament[];
    setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
    lang: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userProfile, allowUnpaid, setAllowUnpaid, tournaments, setTournaments, lang }) => {
  const isSuper = userProfile.role === 'superadmin';
  const [activeTab, setActiveTab] = useState<'users' | 'tournaments' | 'settings'>('users');
  const t = TRANSLATIONS[lang].admin;

  // Form State
  const [newTournament, setNewTournament] = useState({
     name: '',
     description: '',
     start_date: '',
     end_date: '',
     category: 'open',
     max_players: 100
  });

  const handleCreateTournament = (e: React.FormEvent) => {
      e.preventDefault();
      const tournament: Tournament = {
          id: `t${Date.now()}`,
          name: newTournament.name,
          description: newTournament.description,
          start_date: new Date(newTournament.start_date).toISOString(),
          end_date: new Date(newTournament.end_date).toISOString(),
          status: 'planned',
          category: newTournament.category as 'open' | 'validation',
          registered_count: 0,
          max_players: Number(newTournament.max_players)
      };
      
      setTournaments([tournament, ...tournaments]);
      // Reset form
      setNewTournament({ name: '', description: '', start_date: '', end_date: '', category: 'open', max_players: 100 });
      alert(t.success_create);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Header Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
            {isSuper ? t.super_title : t.title}
          </h2>
          <p className="text-slate-500 text-sm md:text-base">{t.subtitle}</p>
        </div>
        
        {/* Tabs Scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex space-x-2 min-w-max">
             <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.tab_users}</button>
             <button onClick={() => setActiveTab('tournaments')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'tournaments' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.tab_tournaments}</button>
             {isSuper && <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.tab_settings}</button>}
          </div>
        </div>
      </div>

      {activeTab === 'settings' && isSuper && (
         <div className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-2xl border-2 border-red-200 dark:border-red-900/50">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4 flex items-center">
               <AlertTriangle className="mr-2" />
               {t.override_title}
            </h3>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm gap-4">
               <div>
                  <h4 className="font-bold text-lg">{t.allow_unpaid_title}</h4>
                  <p className="text-sm text-slate-500 max-w-lg mt-1">
                     {t.allow_unpaid_desc}
                  </p>
               </div>
               <button 
                 onClick={() => setAllowUnpaid(!allowUnpaid)}
                 className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${allowUnpaid ? 'bg-green-500' : 'bg-slate-300'}`}
               >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${allowUnpaid ? 'translate-x-7' : 'translate-x-1'}`} />
               </button>
            </div>
         </div>
      )}

      {activeTab === 'users' && (
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                       <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.table_user}</th>
                       <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.table_role}</th>
                       <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.table_status}</th>
                       <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.table_actions}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {MOCK_PLAYERS.map(p => (
                       <tr key={p.id}>
                          <td className="p-4 font-bold text-sm md:text-base">{p.name}</td>
                          <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{p.role}</span></td>
                          <td className="p-4">
                             {p.is_paid_member 
                               ? <span className="text-green-600 flex items-center text-sm font-bold"><CheckCircle size={16} className="mr-1"/> {t.paid}</span> 
                               : <span className="text-red-500 flex items-center text-sm font-bold"><X size={16} className="mr-1"/> {t.unpaid}</span>
                             }
                          </td>
                          <td className="p-4">
                             {isSuper && <button className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">{t.edit}</button>}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         </div>
      )}

      {activeTab === 'tournaments' && (
         <div className="space-y-6">
             {/* Tournament Creation Form */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-700">
                 <div className="flex items-center space-x-2 mb-6">
                     <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                         <Plus size={24} />
                     </div>
                     <h3 className="text-xl font-bold">{t.create_tournament}</h3>
                 </div>
                 
                 <form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_name}</label>
                         <input required value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Grandmaster Open" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_category}</label>
                         <select value={newTournament.category} onChange={e => setNewTournament({...newTournament, category: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                             <option value="open">Open</option>
                             <option value="validation">Validation</option>
                         </select>
                     </div>
                     <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_desc}</label>
                         <textarea required value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="Description..." />
                     </div>
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_start}</label>
                         <input required value={newTournament.start_date} onChange={e => setNewTournament({...newTournament, start_date: e.target.value})} type="datetime-local" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-500" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_end}</label>
                         <input required value={newTournament.end_date} onChange={e => setNewTournament({...newTournament, end_date: e.target.value})} type="datetime-local" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-500" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{t.form_max}</label>
                         <input required value={newTournament.max_players} onChange={e => setNewTournament({...newTournament, max_players: Number(e.target.value)})} type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                     </div>
                     
                     <button type="submit" className="md:col-span-2 w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95">
                         {t.form_submit}
                     </button>
                 </form>
             </div>

             {/* List of created tournaments preview */}
             <div>
                <h4 className="font-bold text-lg mb-4 text-slate-500">Aperçu de la liste (Vos tournois)</h4>
                <div className="grid gap-4">
                    {tournaments.length === 0 ? (
                        <p className="text-slate-400 italic">Aucun tournoi créé.</p>
                    ) : (
                        tournaments.map(t => (
                            <div key={t.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h5 className="font-bold">{t.name}</h5>
                                    <p className="text-xs text-slate-500">{t.status} • {new Date(t.start_date).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded uppercase">{t.category}</span>
                            </div>
                        ))
                    )}
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

// 2. TOURNAMENTS PAGE (No Simulation)
const TournamentCard: React.FC<{ t: any, userProfile: UserProfile, allowUnpaid: boolean, lang: Language }> = ({ t, userProfile, allowUnpaid, lang }) => {
   const [timeLeft, setTimeLeft] = useState('');
   const trans = TRANSLATIONS[lang].tournaments;
   const common = TRANSLATIONS[lang].common;
   
   useEffect(() => {
      const updateTimer = () => {
         const now = new Date().getTime();
         const start = new Date(t.start_date).getTime();
         const end = new Date(t.end_date).getTime();
         
         if (now >= start && now <= end) {
            // Live
            const distance = end - now;
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${h}${common.hours} ${m}${common.minutes} ${s}${common.seconds}`);
         } else if (now < start) {
            // Planned
            const distance = start - now;
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${d}${common.days} ${h}${common.hours} ${m}${common.minutes}`);
         } else {
            // Ended
            setTimeLeft(trans.ended);
         }
      };
      
      updateTimer(); // Initial call
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
   }, [t, lang]);

   const getDisplayStatus = () => {
       const now = new Date().getTime();
       const start = new Date(t.start_date).getTime();
       const end = new Date(t.end_date).getTime();
       
       if (now >= start && now <= end) return 'live';
       if (now < start) return 'planned';
       return 'finished';
   };

   const displayStatus = getDisplayStatus();
   const canRegister = (userProfile.is_paid_member || allowUnpaid || userProfile.role === 'admin' || userProfile.role === 'superadmin') && displayStatus === 'planned';

   return (
      <div className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-[1.01] flex flex-col justify-between ${displayStatus === 'live' ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-lg'}`}>
         <div>
            <div className="flex justify-between items-start mb-4">
               <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${t.category === 'validation' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                  {t.category === 'open' ? trans.category_open : trans.category_validation}
               </span>
               {displayStatus === 'live' && (
                  <div className="flex items-center space-x-2 bg-red-500/20 px-2 py-1 rounded-full">
                     <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
                     <span className="text-xs font-bold uppercase tracking-wider text-red-400">{trans.status_live}</span>
                  </div>
               )}
            </div>

            <h3 className="text-xl font-bold mb-2 break-words">{t.name}</h3>
            <p className={`text-sm mb-6 ${displayStatus === 'live' ? 'text-indigo-200' : 'text-slate-500'}`}>{t.description}</p>
         </div>
         
         <div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
               <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                  <Clock size={16} className={displayStatus === 'live' ? 'text-indigo-400' : 'text-slate-400'} />
                  <span className="font-mono font-bold text-sm">{displayStatus === 'planned' ? trans.starts_in : ''} {timeLeft}</span>
               </div>
               <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                  <Users size={16} className={displayStatus === 'live' ? 'text-indigo-400' : 'text-slate-400'} />
                  <span className="font-bold text-sm">{t.registered_count} / {t.max_players}</span>
               </div>
            </div>

            <div className="w-full">
               {displayStatus === 'live' ? (
                   <div className="w-full py-3 bg-slate-100/10 border border-white/10 text-slate-300 rounded-xl font-bold text-center text-sm">
                       {trans.status_live} - {trans.players} Active
                   </div>
               ) : displayStatus === 'planned' ? (
                  <button 
                     disabled={!canRegister}
                     className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors ${canRegister ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                     {canRegister ? <Unlock size={18} /> : <Lock size={18} />}
                     <span>{canRegister ? trans.register : trans.payment_required}</span>
                  </button>
               ) : (
                  <button className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl font-bold text-sm">{trans.see_results}</button>
               )}
            </div>
         </div>
      </div>
   );
};

const TournamentsPage = ({ userProfile, allowUnpaid, lang, tournaments }: { userProfile: UserProfile, allowUnpaid: boolean, lang: Language, tournaments: Tournament[] }) => {
   const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'planned' | 'finished'>('all');
   const t = TRANSLATIONS[lang].tournaments;

   const filteredTournaments = tournaments.filter(t => {
       const now = new Date().getTime();
       const start = new Date(t.start_date).getTime();
       const end = new Date(t.end_date).getTime();
       
       let status = 'planned';
       if (now >= start && now <= end) status = 'live';
       else if (now > end) status = 'finished';

       return activeFilter === 'all' ? true : status === activeFilter;
   });

   const getFilterLabel = (f: string) => {
       switch(f) {
           case 'all': return t.filter_all;
           case 'live': return t.filter_live;
           case 'planned': return t.filter_planned;
           case 'finished': return t.filter_finished;
           default: return f;
       }
   };

   return (
      <div className="space-y-8 animate-fade-in pb-20 lg:pb-0">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h2>
               <p className="text-slate-500 text-sm md:text-base">{t.subtitle}</p>
            </div>
            
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
               <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-max">
                  {['all', 'live', 'planned', 'finished'].map((filter) => (
                     <button
                        key={filter}
                        onClick={() => setActiveFilter(filter as any)}
                        className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-indigo-600'}`}
                     >
                        {getFilterLabel(filter)}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {filteredTournaments.length === 0 ? (
             <div className="text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                 <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-slate-500 font-medium">{t.no_tournaments}</p>
             </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map(tournament => (
                <TournamentCard key={tournament.id} t={tournament} userProfile={userProfile} allowUnpaid={allowUnpaid} lang={lang} />
                ))}
            </div>
         )}
      </div>
   );
};

// 3. RANKING PAGE (Responsive)
const RankingPageWithFilters = ({ lang }: { lang: Language }) => {
   const [country, setCountry] = useState('All');
   const [gender, setGender] = useState('All');
   const [minYear, setMinYear] = useState('');
   const t = TRANSLATIONS[lang].ranking;
   
   const filteredPlayers = MOCK_PLAYERS.filter(p => {
      if (country !== 'All' && p.country !== country) return false;
      if (gender !== 'All' && p.gender !== gender) return false;
      if (minYear && p.birth_year < parseInt(minYear)) return false;
      return true;
   }).sort((a,b) => b.elo - a.elo);

   return (
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <h2 className="text-3xl font-bold">{t.title}</h2>
          
          <div className="w-full xl:w-auto p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex items-center mb-3 text-xs font-bold uppercase text-slate-400 tracking-wider">
               <Filter size={14} className="mr-2" /> {TRANSLATIONS[lang].common.filter}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500">
                  <option value="All">{t.all_countries}</option>
                  <option value="NO">Norway 🇳🇴</option>
                  <option value="US">USA 🇺🇸</option>
                  <option value="IT">Italy 🇮🇹</option>
                  <option value="CN">China 🇨🇳</option>
                  <option value="CD">DR Congo 🇨🇩</option>
               </select>
               <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500">
                  <option value="All">{t.all_genders}</option>
                  <option value="M">{t.gender_m}</option>
                  <option value="F">{t.gender_f}</option>
               </select>
               <input 
                  type="number" 
                  placeholder={t.filter_year}
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
               />
            </div>
          </div>
        </div>
    
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
               <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
               <tr>
                  <th className="p-5 font-semibold">{t.rank}</th>
                  <th className="p-5 font-semibold">{t.player}</th>
                  <th className="p-5 font-semibold">{t.country}</th>
                  <th className="p-5 font-semibold">{t.club}</th>
                  <th className="p-5 font-semibold">{t.won}</th>
                  <th className="p-5 font-semibold">{t.elo}</th>
               </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {filteredPlayers.map((p, i) => (
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
                     <td className="p-5 text-sm font-bold">{p.country}</td>
                     <td className="p-5 text-sm text-slate-500">{p.club}</td>
                     <td className="p-5 text-sm font-mono text-center pr-12">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                           🏆 {p.tournaments_won}
                        </span>
                     </td>
                     <td className="p-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.elo}</td>
                  </tr>
               ))}
               </tbody>
            </table>
          </div>
          {filteredPlayers.length === 0 && (
             <div className="p-10 text-center text-slate-500">{t.no_results}</div>
          )}
        </div>
      </div>
   );
};

// 4. PLAY PAGE (REAL MULTIPLAYER & BOT)
const PlayPage = ({ lang, user }: { lang: Language, user: any }) => {
  const t = TRANSLATIONS[lang].game;
  const [mode, setMode] = useState<'online' | 'computer'>('online');
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState<string>('');
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [selectedTime, setSelectedTime] = useState<number>(10); // Default 10 minutes
  
  // Real Multiplayer States
  const [isSearching, setIsSearching] = useState(false);
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<'w' | 'b'>('w');
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  
  const timerRef = useRef<number | null>(null);
  const onlineSubscriptionRef = useRef<any>(null);

  // --- Timer Logic ---
  useEffect(() => {
    if (gameStarted && !game.isGameOver()) {
      timerRef.current = window.setInterval(() => {
        const turn = game.turn();
        if (turn === 'w') {
          setWhiteTime(prev => {
            if (prev <= 0) { setGameStatus(t.black_wins_time); return 0; }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 0) { setGameStatus(t.white_wins_time); return 0; }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, game, gameStatus, t]);

  // --- Reset Logic ---
  const resetGame = () => {
     setGameStarted(false);
     setGame(new Chess());
     setGameStatus('');
     setWhiteTime(selectedTime * 60);
     setBlackTime(selectedTime * 60);
     setOnlineGameId(null);
     setIsSearching(false);
     if (timerRef.current) clearInterval(timerRef.current);
     if (onlineSubscriptionRef.current) supabase.removeChannel(onlineSubscriptionRef.current);
  };

  useEffect(() => {
      resetGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // --- Move Logic ---
  const onMove = async (from: string, to: string) => {
    // 1. Validation de base
    if (game.isGameOver() || (whiteTime <= 0 || blackTime <= 0)) return false;
    
    // 2. Vérifier le tour (Local vs Online)
    if (mode === 'computer') {
       if (game.turn() !== 'w') return false; // Player is always white vs bot
    } else if (mode === 'online') {
       if (game.turn() !== myColor) return false; // Can't move opponent pieces
    }

    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(new Chess(game.fen()));
        checkGameOver();

        // 3. Envoyer le coup au serveur (Online) ou au Bot
        if (mode === 'online' && onlineGameId) {
             await supabase.from('games').update({
                 current_fen: game.fen(),
                 turn: game.turn(),
                 last_move_from: from,
                 last_move_to: to,
                 pgn: game.pgn()
             }).eq('id', onlineGameId);
        } else if (mode === 'computer' && !game.isGameOver()) {
             setTimeout(() => makeBotMove(selectedBot), 500);
        }
        return true;
      }
    } catch (e) { return false; }
    return false;
  };

  // --- Bot Logic ---
  const makeBotMove = (botProfile: any) => {
    if (game.isGameOver()) return;
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    const elo = botProfile ? botProfile.elo : 1000;
    const skillFactor = Math.min(1.0, Math.max(0.05, elo / 3000));
    const shouldPlayBestMove = Math.random() < skillFactor;

    if (shouldPlayBestMove) {
       // Simple heuristic for "good" move
       const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
       game.move(randomMove.san);
    } else {
       const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
       game.move(randomMove.san);
    }
    setGame(new Chess(game.fen()));
    checkGameOver();
  };

  // --- Online Matchmaking Logic ---
  const handleStartOnlineGame = async () => {
      if (!user) { alert("Please login first"); return; }
      setIsSearching(true);
      
      try {
          // 1. Chercher une partie en attente avec le même temps
          const { data: availableGames } = await supabase
            .from('games')
            .select('*')
            .eq('status', 'waiting')
            .eq('time_control', selectedTime)
            .neq('white_player_id', user.id) // Ne pas jouer contre soi-même
            .limit(1);

          if (availableGames && availableGames.length > 0) {
              // Rejoindre la partie
              const gameToJoin = availableGames[0];
              await supabase
                 .from('games')
                 .update({ 
                     black_player_id: user.id, 
                     status: 'ongoing',
                     played_at: new Date().toISOString()
                 })
                 .eq('id', gameToJoin.id);
              
              setOnlineGameId(gameToJoin.id);
              setMyColor('b');
              setOpponentName("Opponent (White)");
              
              // Récupérer infos adversaire (Optionnel, simplifie ici)
              startRealtimeListener(gameToJoin.id);
              setGameStarted(true);
              setWhiteTime(selectedTime * 60);
              setBlackTime(selectedTime * 60);
              setIsSearching(false);
          } else {
              // Créer une nouvelle partie
              const { data: newGame } = await supabase
                 .from('games')
                 .insert({
                     white_player_id: user.id,
                     status: 'waiting',
                     time_control: selectedTime,
                     current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
                 })
                 .select()
                 .single();
              
              if (newGame) {
                  setOnlineGameId(newGame.id);
                  setMyColor('w');
                  setOpponentName("Waiting...");
                  startRealtimeListener(newGame.id);
                  // On reste en searching jusqu'à ce qu'un joueur rejoigne (détecté via realtime)
              }
          }
      } catch (err) {
          console.error("Error matchmaking:", err);
          setIsSearching(false);
      }
  };

  const startRealtimeListener = (gameId: string) => {
      const channel = supabase.channel(`game:${gameId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
             const newData = payload.new;
             
             // 1. Détecter si un joueur rejoint
             if (newData.status === 'ongoing' && newData.black_player_id && isSearching) {
                 setIsSearching(false);
                 setGameStarted(true);
                 setOpponentName("Opponent joined!");
             }

             // 2. Mettre à jour le plateau
             if (newData.current_fen && newData.current_fen !== game.fen()) {
                 const newGame = new Chess(newData.current_fen);
                 setGame(newGame);
                 checkGameOver();
             }
        })
        .subscribe();
      
      onlineSubscriptionRef.current = channel;
  };

  const checkGameOver = () => {
    if (game.isGameOver()) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (game.isCheckmate()) setGameStatus(t.checkmate);
      else if (game.isDraw()) setGameStatus(t.draw_game);
      else setGameStatus(t.game_over);
    }
  };

  const handleStartBotGame = () => {
     setGameStarted(true);
     setGame(new Chess());
     setGameStatus('');
     setWhiteTime(selectedTime * 60);
     setBlackTime(selectedTime * 60);
  };

  const handleResign = () => {
    resetGame();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{t.title}</h2>
         {gameStatus && (
           <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow animate-pulse">
             {gameStatus}
           </div>
         )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {/* Chess Board Container */}
        <div className="lg:col-span-2 w-full order-1">
          <div className="flex justify-center bg-slate-100 dark:bg-slate-800/50 p-2 md:p-8 rounded-3xl shadow-inner min-h-[350px] md:min-h-[500px] items-center relative">
            {/* Searching Overlay */}
            {isSearching && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl">
                    <Loader2 size={64} className="text-indigo-600 animate-spin mb-4" />
                    <p className="text-xl font-bold text-slate-800 dark:text-white">Searching for opponent...</p>
                    <p className="text-slate-500 mt-2">Time Control: {selectedTime} min</p>
                    <button onClick={resetGame} className="mt-6 px-6 py-2 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200">Cancel</button>
                </div>
            )}
            
            <div className="w-full max-w-[600px]">
              <ChessBoard 
                game={game}
                onMove={onMove}
                whiteTime={whiteTime}
                blackTime={blackTime}
                orientation={mode === 'online' && myColor === 'b' ? 'black' : 'white'}
                playerTop={
                  gameStarted && mode === 'computer' && selectedBot ? { name: selectedBot.name, elo: selectedBot.elo, avatar: selectedBot.avatar, isBot: true } 
                  : gameStarted && mode === 'online' ? { name: opponentName, elo: 1200 }
                  : { name: "Adversaire", elo: 1200 }
                }
                playerBottom={{ 
                  name: user?.email ? user.email.split('@')[0] : 'Me', 
                  elo: 1200, 
                  avatar: user?.email ? user.email.charAt(0).toUpperCase() : 'ME'
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls Container */}
        <div className="space-y-6 order-2">
          {/* Mode Switcher */}
          <div className={`bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex transition-opacity ${gameStarted || isSearching ? 'opacity-50 pointer-events-none' : ''}`}>
             <button onClick={() => setMode('online')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${mode === 'online' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
               <Users size={18} /><span>{t.mode_online}</span>
             </button>
             <button onClick={() => setMode('computer')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all ${mode === 'computer' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
               <Cpu size={18} /><span>{t.mode_computer}</span>
             </button>
          </div>
          
          {/* ONLINE SETUP */}
          {mode === 'online' && !gameStarted && !isSearching && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
              <h3 className="font-semibold text-lg mb-4 flex items-center">{t.select_time} (Minutes)</h3>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15, 30, 60].map(time => (
                  <button 
                    key={time} 
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-2 rounded-xl transition-all font-bold text-sm border ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-indigo-400'}`}
                  >
                    {time} min
                  </button>
                ))}
              </div>
              <button 
                onClick={handleStartOnlineGame}
                className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Play size={20} fill="currentColor" /><span>{t.start}</span>
              </button>
            </div>
          )}
          
          {/* BOT SETUP */}
          {mode === 'computer' && !gameStarted && (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in space-y-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{t.select_time}</h3>
                   <div className="grid grid-cols-3 gap-2">
                    {[10, 30, 60].map(time => (
                        <button key={time} onClick={() => setSelectedTime(time)} className={`text-xs py-2 rounded-lg border ${selectedTime === time ? 'bg-purple-600 text-white' : 'bg-slate-50 dark:bg-slate-700'}`}>{time} min</button>
                    ))}
                   </div>
                </div>

                <h3 className="font-semibold text-lg">{t.bot_select}</h3>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {MOCK_BOTS.map(bot => (
                    <div key={bot.id} onClick={() => setSelectedBot(bot)} className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all group ${selectedBot?.id === bot.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-700/50'}`}>
                       <div className="flex items-center space-x-3">
                         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bot.color} flex items-center justify-center text-2xl shadow-sm shrink-0`}>{bot.avatar}</div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center"><span className="font-bold text-slate-800 dark:text-white truncate">{bot.name}</span><span className="font-mono text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 ml-2">{bot.elo}</span></div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{bot.description}</p>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
                <button disabled={!selectedBot} onClick={handleStartBotGame} className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center space-x-2">
                   <Cpu size={20} /><span>{t.start_bot}</span>
                </button>
             </div>
          )}
          
          {/* ACTIVE GAME CONTROLS */}
          {(gameStarted || isSearching) && (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                   <h3 className="font-bold text-lg flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>{t.game_active}</h3>
                </div>
                <div className="h-64 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 overflow-y-auto font-mono text-sm custom-scrollbar border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-6 gap-2 text-slate-500 dark:text-slate-400">
                        {game.history().reduce((acc: any[], move: string, i: number) => {
                          if (i % 2 === 0) {
                             acc.push(<React.Fragment key={i}><span className="col-span-1 text-slate-400">{(i/2)+1}.</span><span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{move}</span></React.Fragment>);
                          } else {
                             acc[acc.length - 1] = (<React.Fragment key={i}>{acc[acc.length - 1]}<span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{move}</span><span className="col-span-1"></span></React.Fragment>);
                          }
                          return acc;
                        }, [])}
                    </div>
                </div>
                <div className="flex space-x-3">
                   <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2"><RefreshCw size={16} /><span>{t.draw}</span></button>
                   <button onClick={handleResign} className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center space-x-2"><Flag size={16} /><span>{t.resign}</span></button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TrainingPage = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang].training;
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskCoach = async () => {
    setLoading(true);
    const demoFen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
    const res = await getChessAdvice(demoFen, "What should I play in this Ruy Lopez opening?");
    setAdvice(res || "Coach is currently reviewing another game. Try again.");
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-3xl font-bold">{t.title}</h2>
        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Premium</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[80px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-1000"></div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center">{t.ai_coach} <span className="ml-3 text-xs bg-white/20 px-2 py-1 rounded border border-white/20">PRO</span></h3>
            <p className="text-indigo-100 mb-8 leading-relaxed text-sm md:text-base">Analyze your games, ask for strategic advice, and understand your mistakes with the power of our AI engine.</p>
            <div className="space-y-4">
              <button onClick={handleAskCoach} disabled={loading} className="w-full py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg">
                {loading ? (<><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {t.analyzing}</>) : (<><span>✨</span><span>{t.ask_coach}</span></>)}
              </button>
            </div>
            {advice && (
              <div className="mt-8 p-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 animate-fade-in-up">
                <div className="flex items-start space-x-3"><div className="text-2xl">💡</div><div><h4 className="font-bold text-white mb-1">{t.advice_title}</h4><p className="text-sm text-indigo-100 italic leading-relaxed">"{advice}"</p></div></div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-xl mb-6">{t.learning_path}</h3>
           <div className="space-y-4">
             {['Rook Endgames', 'Mastering King\'s Indian Defense', 'Tactics for Beginners', 'Chess Psychology'].map((course, i) => (
               <div key={i} className="flex items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                   <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 </div>
                 <div className="flex-1">
                   <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">{course}</h4>
                   <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${(4-i)*20}%`}}></div></div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState('play');
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Super Admin Global State Mock
  const [allowUnpaidTournaments, setAllowUnpaidTournaments] = useState(false);
  
  // State for tournaments (Moved up from constants/TournamentsPage)
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);

  // MOCK PROFILE FOR DEMO - In real app, fetch from Supabase 'profiles' table using user.id
  // Change this role manually here to test: 'member' | 'admin' | 'superadmin'
  const mockUserProfile: UserProfile = {
     id: user?.id || '1',
     username: 'Me',
     role: 'superadmin', // SET THIS TO 'superadmin' TO SEE THE BUTTON
     full_name: 'My Name',
     elo_rapid: 1200,
     is_paid_member: false, // Default unpaid to test the override
     country: 'CD',
     gender: 'M',
     birth_year: 1995,
     tournaments_won: 0
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setView('app');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { setView('app'); setIsAuthModalOpen(false); } else { setView('landing'); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (view === 'landing') {
    return (
      <>
        <LandingPage onLoginClick={() => setIsAuthModalOpen(true)} lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} />
      </>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'play': return <PlayPage lang={lang} user={user} />;
      case 'ranking': return <RankingPageWithFilters lang={lang} />;
      case 'training': return <TrainingPage lang={lang} />;
      case 'tournaments': return <TournamentsPage userProfile={mockUserProfile} allowUnpaid={allowUnpaidTournaments} lang={lang} tournaments={tournaments} />;
      case 'admin': return <AdminDashboard userProfile={mockUserProfile} allowUnpaid={allowUnpaidTournaments} setAllowUnpaid={setAllowUnpaidTournaments} lang={lang} tournaments={tournaments} setTournaments={setTournaments} />;
      case 'news': return (
        <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
          <h2 className="text-3xl font-bold">{TRANSLATIONS[lang].nav.news}</h2>
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
          <p className="text-xl font-light">{TRANSLATIONS[lang].common.loading}</p>
        </div>
      );
    }
  };

  return (
    <Layout currentLang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} currentPage={currentPage} setPage={setCurrentPage} user={user} userProfile={mockUserProfile}>
      {renderPage()}
    </Layout>
  );
};

export default App;
