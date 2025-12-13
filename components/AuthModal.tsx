
import React, { useState } from 'react';
import { X, Mail, Lock, Loader, Eye, EyeOff, AlertTriangle, User, Flag } from 'lucide-react';
import { signIn, signUp } from '../services/supabase';
import { TRANSLATIONS, COUNTRIES } from '../constants';
import { Language } from '../types';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Nouveaux champs pour l'inscription
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('CD');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang].auth;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Validation des mots de passe lors de l'inscription
    if (!isLogin && password !== confirmPassword) {
       setError(t.password_mismatch);
       setLoading(false);
       return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        // Navigation will be handled by onAuthStateChange in App.tsx
        onClose();
      } else {
        // Lors de l'inscription, on passe les métadonnées (nom, pays)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    country: country
                }
            }
        });

        if (error) {
            console.error("Signup detailed error:", error);
            
            // Check specifically for the Trigger error from Postgres
            if (error.message.includes("Database error") || error.message.includes("internal server error") || error.code === "500") {
                throw new Error("Erreur technique lors de la création du profil. Assurez-vous d'avoir exécuté le script de RESET TOTAL dans Supabase.");
            }
            throw error;
        }
        setSuccessMsg(t.success_register);
    }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
      setIsLogin(!isLogin); 
      setError(null); 
      setSuccessMsg(null);
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setCountry('CD');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative Header */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-violet-600 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-8 text-white">
            <h2 className="text-2xl font-bold">{isLogin ? t.login_title : t.register_title}</h2>
            <p className="text-indigo-100 text-sm opacity-90">ChessNetra Secure Access</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm rounded-lg border border-green-200 dark:border-green-800">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nom Complet (Inscription seulement) */}
            {!isLogin && (
                 <div className="space-y-1 animate-fade-in">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{t.fullname_label}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                 </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{t.email_label}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="grandmaster@chess.com"
                />
              </div>
            </div>
            
            {/* Pays (Inscription seulement) */}
            {!isLogin && (
                 <div className="space-y-1 animate-fade-in">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{t.country_label}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Flag size={18} className="text-slate-400" />
                        </div>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                        >
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                           <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                 </div>
            )}

            {/* Mot de passe */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{t.password_label}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation Mot de passe */}
            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">{t.confirm_password_label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (isLogin ? t.submit_login : t.submit_register)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={resetForm}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? t.switch_to_register : t.switch_to_login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
