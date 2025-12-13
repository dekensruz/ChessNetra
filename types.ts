
export interface UserProfile {
  id: string;
  username: string;
  email?: string; // Added for UI convenience
  full_name: string;
  elo_rapid: number;
  club_id?: string;
  club_name?: string; // Helper for UI
  avatar_url?: string;
  role: 'member' | 'admin' | 'superadmin';
  country: string;
  gender: 'M' | 'F' | 'Other';
  birth_year: number;
  tournaments_won: number;
  is_paid_member: boolean;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  member_count: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string; // ISO String
  end_date: string;   // ISO String
  status: 'planned' | 'live' | 'finished';
  category: 'open' | 'validation';
  registered_count: number;
  max_players?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'info' | 'tournament' | 'training' | 'club';
  date: string;
  pinned: boolean;
}

export type Language = 'fr' | 'en';
export type Theme = 'light' | 'dark';

export interface GameConfig {
  time: number; // minutes
  increment: number; // seconds
}
