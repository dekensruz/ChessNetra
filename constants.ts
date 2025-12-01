
import { Language } from './types';

export const TRANSLATIONS = {
  fr: {
    nav: {
      play: "Jouer",
      ranking: "Classement",
      calendar: "Calendrier",
      profile: "Profil",
      tournaments: "Tournois",
      training: "Formation",
      news: "Annonces",
      chat: "Discussion",
      clubs: "Clubs",
      login: "Espace Membre",
      home: "Accueil",
      about: "À propos",
      contact: "Contact",
      logout: "Déconnexion"
    },
    auth: {
      login_title: "Bon retour parmi nous",
      register_title: "Créer un compte",
      email_label: "Adresse Email",
      password_label: "Mot de passe",
      submit_login: "Se connecter",
      submit_register: "S'inscrire",
      switch_to_register: "Pas encore de compte ? Créer un compte",
      switch_to_login: "Déjà membre ? Se connecter",
      error_generic: "Une erreur est survenue.",
      success_register: "Compte créé ! Veuillez vérifier votre email.",
      loading: "Chargement..."
    },
    landing: {
      hero_title: "La Stratégie à l'État Pur",
      hero_subtitle: "Rejoignez l'élite des échecs mondiaux. Affrontez des joueurs de tous horizons, analysez avec notre IA de pointe et dominez l'échiquier.",
      cta_primary: "Commencer à Jouer",
      cta_secondary: "Découvrir les Clubs",
      stats_players: "Joueurs Actifs",
      stats_matches: "Parties Jouées",
      stats_clubs: "Clubs Officiels",
      feature_1_title: "Compétition Intense",
      feature_1_desc: "Tournois quotidiens et classement ELO certifié.",
      feature_2_title: "Coach IA Avancé",
      feature_2_desc: "Une intelligence artificielle qui analyse vos coups en temps réel pour vous faire progresser.",
      feature_3_title: "Communauté Globale",
      feature_3_desc: "Connectez-vous avec des passionnés du monde entier.",
      footer_desc: "La plateforme d'échecs nouvelle génération. Développez votre potentiel, affrontez les meilleurs.",
      footer_links_title: "Liens Rapides",
      footer_legal_title: "Légal",
      footer_contact_title: "Nous contacter",
      rights: "Tous droits réservés."
    },
    home: {
      welcome: "Bienvenue sur ChessNetra",
      subtitle: "La plateforme d'échecs de référence.",
      cta_play: "Jouer une partie",
      cta_join: "Rejoindre un club"
    },
    game: {
      title: "Arène de Jeu",
      mode_online: "En Ligne",
      mode_computer: "Ordinateur",
      select_time: "Cadence de jeu",
      start: "Rechercher un adversaire",
      start_bot: "Défier ce Bot",
      opponent: "Adversaire",
      vs: "VS",
      bot_select: "Choisir un Adversaire Virtuel",
      game_active: "Partie en cours",
      resign: "Abandonner",
      draw: "Proposer Nulle",
      history: "Historique"
    },
    training: {
      title: "Académie ChessNetra",
      ai_coach: "Coach IA Virtuel",
      ask_coach: "Demander conseil à l'IA",
      placeholder: "Copiez le FEN ou décrivez la situation..."
    }
  },
  en: {
    nav: {
      play: "Play",
      ranking: "Rankings",
      calendar: "Calendar",
      profile: "Profile",
      tournaments: "Tournaments",
      training: "Training",
      news: "News",
      chat: "Chat",
      clubs: "Clubs",
      login: "Member Area",
      home: "Home",
      about: "About",
      contact: "Contact",
      logout: "Sign Out"
    },
    auth: {
      login_title: "Welcome Back",
      register_title: "Create Account",
      email_label: "Email Address",
      password_label: "Password",
      submit_login: "Sign In",
      submit_register: "Sign Up",
      switch_to_register: "No account? Create one",
      switch_to_login: "Already a member? Sign In",
      error_generic: "An error occurred.",
      success_register: "Account created! Please check your email.",
      loading: "Loading..."
    },
    landing: {
      hero_title: "Pure Strategy Unleashed",
      hero_subtitle: "Join the global chess elite. Compete internationally, analyze with advanced AI, and dominate the board.",
      cta_primary: "Start Playing",
      cta_secondary: "Discover Clubs",
      stats_players: "Active Players",
      stats_matches: "Matches Played",
      stats_clubs: "Official Clubs",
      feature_1_title: "Intense Competition",
      feature_1_desc: "Daily tournaments and certified ELO ranking.",
      feature_2_title: "Advanced AI Coach",
      feature_2_desc: "Artificial intelligence analyzing your moves in real-time to help you improve.",
      feature_3_title: "Global Community",
      feature_3_desc: "Connect with enthusiasts from around the world.",
      footer_desc: "The next-gen chess platform. Unlock your potential, play the best.",
      footer_links_title: "Quick Links",
      footer_legal_title: "Legal",
      footer_contact_title: "Contact Us",
      rights: "All rights reserved."
    },
    home: {
      welcome: "Welcome to ChessNetra",
      subtitle: "The leading chess platform.",
      cta_play: "Play a Game",
      cta_join: "Join a Club"
    },
    game: {
      title: "Game Arena",
      mode_online: "Online",
      mode_computer: "Computer",
      select_time: "Time Control",
      start: "Find Opponent",
      start_bot: "Challenge Bot",
      opponent: "Opponent",
      vs: "VS",
      bot_select: "Choose Virtual Opponent",
      game_active: "Game in Progress",
      resign: "Resign",
      draw: "Offer Draw",
      history: "History"
    },
    training: {
      title: "ChessNetra Academy",
      ai_coach: "Virtual AI Coach",
      ask_coach: "Ask AI for Advice",
      placeholder: "Paste FEN or describe position..."
    }
  }
};

export const MOCK_PLAYERS = [
  { id: '1', name: 'Magnus C.', elo: 2830, club: 'Norway Knights' },
  { id: '2', name: 'Hikaru N.', elo: 2780, club: 'Streamer Elite' },
  { id: '3', name: 'Fabiano C.', elo: 2750, club: 'Italian Stallions' },
  { id: '4', name: 'Ding L.', elo: 2745, club: 'Eastern Dragons' },
];

export const MOCK_BOTS = [
  { id: 'bot_1', name: 'Junior', elo: 400, description: 'Learning the rules. Makes random moves.', color: 'from-green-400 to-green-600', avatar: '👶' },
  { id: 'bot_2', name: 'Casual Carl', elo: 800, description: 'Plays occasionally. Blunders often.', color: 'from-teal-400 to-teal-600', avatar: '🙂' },
  { id: 'bot_3', name: 'Strategic Sarah', elo: 1200, description: 'Solid fundamentals. Hard to trick.', color: 'from-blue-400 to-blue-600', avatar: '🧐' },
  { id: 'bot_4', name: 'Tactical Tom', elo: 1600, description: 'Aggressive style. Watch your queen!', color: 'from-orange-400 to-orange-600', avatar: '⚔️' },
  { id: 'bot_5', name: 'Master Mind', elo: 2200, description: 'Fide Master level. Very few mistakes.', color: 'from-purple-400 to-purple-600', avatar: '🧙‍♂️' },
  { id: 'bot_6', name: 'Deep Blue', elo: 3000, description: 'Super Grandmaster engine. Unbeatable.', color: 'from-red-500 to-slate-900', avatar: '🤖' },
];

export const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: 'Global Spring Championship', category: 'tournament', date: '2024-03-15', pinned: true, content: 'Register now for the biggest event of the season. Prize pool: $50,000. Open to all players worldwide.' },
  { id: '2', title: 'Goma International Open', category: 'tournament', date: '2024-04-20', pinned: false, content: 'Join us at the ChessNetra HQ in Goma, DRC, or participate online for this special hybrid event.' },
  { id: '3', title: 'Sicilian Defense Masterclass', category: 'training', date: '2024-03-10', pinned: false, content: 'Grandmaster analysis of the latest Sicilian trends.' },
];
