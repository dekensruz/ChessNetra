
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Theme } from '../types';
import { LogOut, Menu, X, Shield } from 'lucide-react';
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
  userProfile?: any; // Ajout du profil complet pour vérifier le rôle
}

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800'
    }`}
  >
    <span className={`transition-colors ${active ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-600'}`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentLang, setLang, theme, toggleTheme, currentPage, setPage, user, userProfile
}) => {
  const t = TRANSLATIONS[currentLang].nav;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simple SVG Icons
  const Icons = {
    Play: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>,
    Ranking: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20V10m-6 10v-4m12 4v-6"/></svg>,
    Calendar: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4m-5 4h18"/></svg>,
    Tournaments: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
    Training: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>,
    News: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>,
    Chat: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
    Clubs: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
    Profile: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavClick = (page: string) => {
    setPage(page);
    setSidebarOpen(false);
  };

  const isAdminOrSuper = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
               <span className="text-white font-bold">CN</span>
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">ChessNetra</span>
         </div>
         <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
           <Menu size={24} />
         </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-start lg:space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <span className="text-white font-bold text-xl">CN</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden lg:block">ChessNetra</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 pb-4">
             <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700">
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                 {userProfile?.role === 'superadmin' ? 'S' : userProfile?.role === 'admin' ? 'A' : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user.email?.split('@')[0]}</p>
                 <div className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${userProfile?.role === 'superadmin' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{userProfile?.role || 'Member'}</p>
                 </div>
               </div>
             </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem active={currentPage === 'play'} onClick={() => handleNavClick('play')} icon={Icons.Play} label={t.play} />
          <NavItem active={currentPage === 'ranking'} onClick={() => handleNavClick('ranking')} icon={Icons.Ranking} label={t.ranking} />
          <NavItem active={currentPage === 'tournaments'} onClick={() => handleNavClick('tournaments')} icon={Icons.Tournaments} label={t.tournaments} />
          <NavItem active={currentPage === 'clubs'} onClick={() => handleNavClick('clubs')} icon={Icons.Clubs} label={t.clubs} />
          <NavItem active={currentPage === 'training'} onClick={() => handleNavClick('training')} icon={Icons.Training} label={t.training} />
          
          {/* Admin Link (Protected) */}
          {isAdminOrSuper && (
             <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <NavItem 
                  active={currentPage === 'admin'} 
                  onClick={() => handleNavClick('admin')} 
                  icon={<Shield size={20} />} 
                  label={t.admin} 
                />
             </div>
          )}

          <NavItem active={currentPage === 'calendar'} onClick={() => handleNavClick('calendar')} icon={Icons.Calendar} label={t.calendar} />
          <NavItem active={currentPage === 'news'} onClick={() => handleNavClick('news')} icon={Icons.News} label={t.news} />
          <NavItem active={currentPage === 'chat'} onClick={() => handleNavClick('chat')} icon={Icons.Chat} label={t.chat} />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
           <NavItem active={currentPage === 'profile'} onClick={() => handleNavClick('profile')} icon={Icons.Profile} label={t.profile} />
           
           <div className="flex items-center justify-between px-4 py-2">
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                {theme === 'dark' ? '☀️' : '🌙'}
             </button>
             <button onClick={() => setLang(currentLang === 'fr' ? 'en' : 'fr')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
               {currentLang.toUpperCase()}
             </button>
           </div>
           
           <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center space-x-2 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <LogOut size={16} />
              <span>{t.logout}</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-4 pt-20 lg:pt-8 lg:p-8 overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
};
