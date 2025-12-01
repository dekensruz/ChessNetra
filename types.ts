export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  elo_rapid: number;
  club_id?: string;
  avatar_url?: string;
  role: 'member' | 'admin' | 'superadmin';
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
  date: string;
  status: 'planned' | 'live' | 'finished';
  registered: number;
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
