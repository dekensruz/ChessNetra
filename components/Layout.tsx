
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Theme } from '../types';
import { LogOut, Menu, X, Shield, Swords, Trophy, Users, User, MoreHorizontal, Settings, HelpCircle, Info, Zap } from 'lucide-react';
import { signOut } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  currentLang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  currentPage: string;
  setPage: (p: string) => void;
  user: any;
  userProfile?: any;
}

const NavItem = ({ active, onClick, icon, label, collapsed = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-4'} py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
      {icon}
    </span>
    {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
  </button>
);

const BottomNavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
      active ? 'text-blue-600 scale-110' : 'text-slate-400'
    }`}
  >
    <div className={`p-1.5 rounded-xl ${active ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className={`text-[9px] font-black uppercase mt-0.5 tracking-tighter ${active ? 'opacity-100' : 'opacity-50'}`}>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentLang, setLang, theme, toggleTheme, currentPage, setPage, user, userProfile
}) => {
  const t = TRANSLATIONS[currentLang].nav;
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const isAdminOrSuper = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 shadow-2xl z-50">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
             <span className="text-white font-black text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500 dark:from-white dark:to-slate-400">ChessNetra</h1>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <NavItem active={currentPage === 'play'} onClick={() => setPage('play')} icon={<Swords size={20} />} label={t.play} />
          <NavItem active={currentPage === 'tournaments'} onClick={() => setPage('tournaments')} icon={<Trophy size={20} />} label={t.tournaments} />
          <NavItem active={currentPage === 'clubs'} onClick={() => setPage('clubs')} icon={<Users size={20} />} label={t.clubs} />
          {isAdminOrSuper && (
            <NavItem active={currentPage === 'admin'} onClick={() => setPage('admin')} icon={<Shield size={20} />} label={t.admin} />
          )}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <NavItem active={currentPage === 'profile'} onClick={() => setPage('profile')} icon={<User size={20} />} label={t.profile} />
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors font-bold text-sm">
             <LogOut size={18} />
             <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 px-6 flex items-center justify-between">
         <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <span className="text-white font-bold">C</span>
            </div>
            <span className="font-black tracking-tighter text-xl">ChessNetra</span>
         </div>
         <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <div onClick={() => setPage('profile')} className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-white text-xs font-black cursor-pointer">
               {userProfile?.username?.charAt(0).toUpperCase()}
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 lg:pt-0 lg:pb-0 overflow-x-hidden overflow-y-auto custom-scrollbar h-screen">
        <div className="p-4 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 w-full h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-4 pb-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <BottomNavItem active={currentPage === 'play'} onClick={() => setPage('play')} icon={<Swords />} label={t.play} />
        <BottomNavItem active={currentPage === 'tournaments'} onClick={() => setPage('tournaments')} icon={<Trophy />} label={t.tournaments} />
        
        {/* Central Button Action (C.com style) */}
        <div className="relative -top-8">
            <button 
                onClick={() => setMoreMenuOpen(true)}
                className="w-16 h-16 bg-blue-600 text-white rounded-[24px] shadow-2xl shadow-blue-500/50 flex items-center justify-center transform active:scale-90 transition-transform border-4 border-white dark:border-slate-950"
            >
                <Zap size={32} fill="currentColor" />
            </button>
        </div>

        <BottomNavItem active={currentPage === 'clubs'} onClick={() => setPage('clubs')} icon={<Users />} label={t.clubs} />
        <BottomNavItem active={currentPage === 'profile'} onClick={() => setPage('profile')} icon={<User />} label={t.profile} />
      </nav>

      {/* Mobile "Plus" Menu Overlay */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-md animate-fade-in flex items-end">
           <div className="w-full bg-white dark:bg-slate-900 rounded-t-[40px] p-8 pb-12 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-fade-in-up">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tighter">Actions Rapides</h2>
                    <button onClick={() => setMoreMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setPage('play'); setMoreMenuOpen(false); }} className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl text-left border border-blue-100 dark:border-blue-900/30">
                        <Swords className="text-blue-600 mb-3" size={32} />
                        <span className="block font-black text-sm">Nouvelle Partie</span>
                    </button>
                    <button onClick={() => { setPage('tournaments'); setMoreMenuOpen(false); }} className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl text-left border border-amber-100 dark:border-amber-900/30">
                        <Trophy className="text-amber-500 mb-3" size={32} />
                        <span className="block font-black text-sm">Rejoindre Tournoi</span>
                    </button>
                    <button onClick={() => { setPage('profile'); setMoreMenuOpen(false); }} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-left border border-slate-100 dark:border-slate-700">
                        <User className="text-slate-500 mb-3" size={32} />
                        <span className="block font-black text-sm">Mon Profil</span>
                    </button>
                    {isAdminOrSuper && (
                        <button onClick={() => { setPage('admin'); setMoreMenuOpen(false); }} className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl text-left border border-indigo-100 dark:border-indigo-900/30">
                            <Shield className="text-indigo-600 mb-3" size={32} />
                            <span className="block font-black text-sm">Console Admin</span>
                        </button>
                    )}
                </div>
           </div>
        </div>
      )}
    </div>
  );
};
