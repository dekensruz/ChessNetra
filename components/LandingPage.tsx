
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Theme } from '../types';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, Menu, X } from 'lucide-react';

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
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navbar Landing */}
      <nav className="fixed w-full z-50 glass border-b border-slate-200/50 dark:border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:rotate-12 transition-transform">
                <span className="text-white font-bold text-xl">CN</span>
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-300">
                ChessNetra
              </span>
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
               <a href="#" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{navT.home}</a>
               <a href="#features" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{navT.training}</a>
               <a href="#clubs" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{navT.clubs}</a>
               <a href="#about" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{navT.about}</a>
            </div>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} 
                className="font-bold text-xs uppercase tracking-wide border border-slate-300 dark:border-slate-600 px-2 py-1 rounded hover:border-indigo-500 transition-colors"
              >
                {lang}
              </button>
              <button 
                onClick={onLoginClick}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                {navT.login}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-b border-slate-200/50 dark:border-white/10 absolute w-full animate-fade-in-up">
            <div className="px-4 pt-2 pb-6 space-y-2">
               <a href="#" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800">{navT.home}</a>
               <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800">{navT.training}</a>
               <a href="#clubs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800">{navT.clubs}</a>
               <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 mt-2">
                 <div className="flex space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="px-3 py-2 rounded font-bold bg-slate-100 dark:bg-slate-800 uppercase text-xs">
                      {lang}
                    </button>
                 </div>
                 <button onClick={onLoginClick} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-md">
                   {navT.login}
                 </button>
               </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex-grow relative pt-24 pb-12 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm tracking-wide border border-indigo-200 dark:border-indigo-700">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></span>
                International Chess Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight break-words">
                {t.hero_title.split(' ').map((word, i) => (
                  <span key={i} className={i >= 1 && i <= 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600" : ""}>
                    {word}{' '} 
                  </span>
                ))}
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t.hero_subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={onLoginClick}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 hover:scale-105"
                >
                  {t.cta_primary}
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  {t.cta_secondary}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">1M+</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">{t.stats_players}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">50k+</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">{t.stats_matches}</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">100+</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">{t.stats_clubs}</p>
                </div>
              </div>
            </div>

            {/* Visual Content (3D Chess Board Representation) */}
            <div className="relative animate-float block order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative w-full aspect-square max-w-[300px] lg:max-w-lg mx-auto transform hover:scale-105 transition-transform duration-700">
                {/* Abstract Board */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl transform rotate-6 opacity-20 blur-xl"></div>
                <div className="absolute inset-0 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex items-center justify-center">
                   {/* Decorative Grid */}
                   <div className="grid grid-cols-4 grid-rows-4 w-full h-full opacity-30">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`border border-white/10 ${(Math.floor(i/4) + i%4) % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`}></div>
                      ))}
                   </div>
                   
                   {/* Centerpiece Text */}
                   <div className="absolute text-center glass-card p-6 lg:p-8 rounded-2xl shadow-2xl">
                     <div className="text-5xl lg:text-6xl mb-2 filter drop-shadow-lg">♚</div>
                     <h3 className="text-xl lg:text-2xl font-bold text-white">Grandmaster</h3>
                     <p className="text-indigo-300 text-sm lg:text-base">Global Edition</p>
                   </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-5 -right-5 lg:-top-10 lg:-right-10 bg-white dark:bg-slate-800 p-3 lg:p-4 rounded-xl shadow-xl animate-bounce border border-slate-100 dark:border-slate-700" style={{animationDuration: '3s'}}>
                   <span className="text-2xl lg:text-3xl">🏆</span>
                </div>
                <div className="absolute -bottom-2 -left-2 lg:-bottom-5 lg:-left-5 bg-white dark:bg-slate-800 p-3 lg:p-4 rounded-xl shadow-xl animate-bounce border border-slate-100 dark:border-slate-700" style={{animationDuration: '4s'}}>
                   <span className="text-2xl lg:text-3xl">🌎</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-20 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ChessNetra?</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-default border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                ⚔️
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature_1_title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature_1_desc}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-default border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature_2_title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature_2_desc}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-default border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🌍
              </div>
              <h3 className="text-xl font-bold mb-3">{t.feature_3_title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.feature_3_desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CN</span>
                </div>
                <span className="font-bold text-xl text-white">ChessNetra</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                {t.footer_desc}
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
                <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">{t.footer_links_title}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">{navT.home}</a></li>
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">{navT.training}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">{navT.tournaments}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">{navT.ranking}</a></li>
              </ul>
            </div>

            {/* Legal / Contact Column */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">{t.footer_contact_title}</h3>
              <ul className="space-y-3 text-sm">
                 <li className="flex items-center space-x-2">
                   <Mail size={16} className="text-indigo-500" />
                   <span>support@chessnetra.com</span>
                 </li>
                 <li className="flex items-center space-x-2">
                   <Phone size={16} className="text-indigo-500" />
                   <span>+243 970 000 000</span>
                 </li>
                 <li className="flex items-start space-x-2">
                   <MapPin size={16} className="text-indigo-500 mt-1" />
                   <span>Siège Social<br/>Goma, Nord-Kivu, RDC</span>
                 </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h3>
              <p className="text-xs text-slate-400 mb-4">Stay updated with tournaments and news.</p>
              <div className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 transition-colors"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; 2024 ChessNetra. {t.rights}</p>
            <p className="mt-2 md:mt-0 flex items-center">
              Made with <span className="text-red-500 mx-1">❤</span> in Goma for the World.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
