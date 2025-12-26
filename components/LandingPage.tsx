
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Theme } from '../types';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, Menu, X, Zap } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, lang, setLang, theme, toggleTheme }) => {
  const t = TRANSLATIONS[lang].landing;
  const navT = TRANSLATIONS[lang].nav;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navbar Landing */}
      <nav className="fixed w-full z-50 glass border-b border-slate-200/50 dark:border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform">
                <span className="text-white font-black text-xl">C</span>
              </div>
              <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-white dark:to-slate-300">
                ChessNetra
              </span>
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-10">
               <a href="#" className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{navT.home}</a>
               <a href="#features" className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{navT.training}</a>
               <a href="#clubs" className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{navT.clubs}</a>
            </div>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center space-x-5">
              <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={onLoginClick}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[20px] shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                {navT.login}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden flex flex-col justify-center">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '3s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                <Zap size={14} className="mr-2 fill-current" />
                Plateforme Internationale d'Échecs
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] break-words">
                {t.hero_title.split(' ').map((word, i) => (
                  <span key={i} className={i >= 1 && i <= 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" : ""}>
                    {word}{' '} 
                  </span>
                ))}
              </h1>
              <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold">
                {t.hero_subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-5">
                <button 
                  onClick={onLoginClick}
                  className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/40 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 text-lg"
                >
                  {t.cta_primary}
                </button>
                <button className="w-full sm:w-auto px-12 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-[24px] shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg">
                  {t.cta_secondary}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-200 dark:border-slate-800 pt-10">
                <div className="text-center lg:text-left">
                  <p className="text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">1M+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">{t.stats_players}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">50k+</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">{t.stats_matches}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">12</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">Clubs Pro</p>
                </div>
              </div>
            </div>

            {/* Visual Content (3D Chess Board Representation) */}
            <div className="relative animate-float block order-1 lg:order-2">
              <div className="relative w-full aspect-square max-w-[350px] lg:max-w-xl mx-auto">
                <div className="absolute inset-0 bg-blue-600 rounded-[64px] transform rotate-6 opacity-20 blur-[80px]"></div>
                <div className="absolute inset-0 bg-slate-950 rounded-[64px] shadow-2xl border-4 border-slate-800 overflow-hidden flex items-center justify-center p-8">
                   <div className="grid grid-cols-4 grid-rows-4 w-full h-full opacity-20">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`border border-white/10 ${(Math.floor(i/4) + i%4) % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}></div>
                      ))}
                   </div>
                   
                   <div className="absolute text-center p-12 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-3xl">
                     <div className="text-7xl lg:text-9xl mb-6 filter drop-shadow-2xl">♚</div>
                     <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">ChessNetra</h3>
                     <p className="text-blue-400 text-sm lg:text-lg font-bold">Dominer l'Échiquier</p>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="inline-flex items-center space-x-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-black">C</span>
                </div>
                <span className="font-black text-2xl text-white tracking-tighter">ChessNetra</span>
            </div>
            <p className="max-w-2xl mx-auto mb-12 font-bold leading-relaxed">
                La plateforme référence pour le développement des échecs en Afrique Centrale. 
                Jouez, apprenez et connectez-vous avec des milliers de passionnés.
            </p>
            <div className="flex justify-center space-x-10 text-xs font-black uppercase tracking-widest text-slate-500 mb-12">
                <a href="#" className="hover:text-white transition-colors">Accueil</a>
                <a href="#" className="hover:text-white transition-colors">Tournois</a>
                <a href="#" className="hover:text-white transition-colors">Clubs</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                <p>&copy; 2025 ChessNetra. Fait avec passion à Goma.</p>
                <div className="flex space-x-6 mt-6 md:mt-0">
                    <Instagram size={20} className="hover:text-white cursor-pointer" />
                    <Twitter size={20} className="hover:text-white cursor-pointer" />
                    <Facebook size={20} className="hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
