# ChessNetra ♟️

**ChessNetra** is a next-generation chess platform combining professional gameplay, community features, and AI-powered coaching. Headquartered in **Goma, DRC**, with a global vision, it connects players from all around the world.

## ✨ Features

### 🎮 Gameplay
- **Interactive Chess Board**: Full drag-and-drop support, legal move highlighting, and visual move history.
- **Game Modes**:
  - **Online**: UI for matchmaking.
  - **Vs Computer**: Play against Bots with distinct personalities and adaptive ELO (from Beginner to Grandmaster).
- **Game Logic**: Complete rules implementation (Checkmate, Stalemate, Promotion, Castling) using `chess.js`.
- **Real-time Stats**: Timers, captured pieces display, and move history.

### 🧠 AI Coaching
- **Virtual Coach**: Integration with **Google Gemini AI** to analyze current board positions (FEN) and provide strategic advice in natural language.

### 👤 User Experience
- **Authentication**: Secure Sign Up/Sign In via **Supabase**.
- **Responsive Design**: Fully mobile-optimized with an off-canvas sidebar menu.
- **Theming**: Native Dark Mode and Light Mode support.
- **Localization**: Bilingual interface (English / French).
- **Modern UI**: Glassmorphism effects, smooth transitions, and 3D visual elements.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Logic**: Chess.js (Game Engine)
- **Backend / Auth**: Supabase
- **AI**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chessnetra.git
   cd chessnetra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The application requires API keys for Supabase and Google Gemini.
   
   Create a `.env` file in the root directory (optional, as keys are currently hardcoded for demo purposes in `services/supabase.ts`):
   ```env
   API_KEY=your_google_gemini_api_key
   ```
   *Note: The Supabase configuration is currently located in `services/supabase.ts`.*

4. **Run the application**
   ```bash
   npm start
   ```

## 🗄️ Database Setup (Supabase)

To set up the backend, run the SQL script provided in `database.txt` inside your Supabase SQL Editor. This will create:
- `profiles` table (linked to Auth)
- `games`, `tournaments`, `clubs` tables
- Row Level Security (RLS) policies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.

---

**ChessNetra** - *La Stratégie à l'État Pur.*
Made with ❤️ in Goma.
