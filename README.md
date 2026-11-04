# YouTube Playlist Tracker

A full-stack, personal learning and video tracking web application built with **React**, **Vite**, **Tailwind CSS**, and **Node.js/Express**.

Paste any YouTube playlist link, automatically fetch and parse all videos (with video durations, thumbnails, channel name, and ordering), and track your learning progress across multiple independent playlists with per-video checkboxes, persistent study notes, filters, and real-time statistics.

---

## Features

- **Dashboard / Multi-Playlist Management**:
  - View all your tracked playlists at a glance with progress bars, video counts, and last accessed dates.
  - Create and manage unlimited independent playlists without needing multiple accounts.
  - Search playlists by title or channel name.
  - Sort playlists by recently updated, highest/lowest progress, video count, or title.
  - Filter playlists by status (*All*, *In Progress*, *Completed*, *Not Started*).
  - Rename or delete trackers with confirmation modals.

- **Automated YouTube Playlist Importing**:
  - Accepts full YouTube playlist URLs, watch URLs with playlist query parameters, or raw playlist IDs.
  - Built-in multi-page pagination using the official **YouTube Data API v3** to import entire playlists.
  - Fetches accurate video durations (parsed from ISO 8601 `PT#H#M#S` into human-friendly time).
  - **1-Click Demo Import**: Try curated playlists (*Striver A2Z DSA*, *CodeWithHarry Web Dev*, *React 19 Masterclass*) immediately without needing an API key!

- **Dedicated Playlist Tracking Page**:
  - Aggregate statistics: Total videos, Completed videos, Remaining videos, Progress percentage, Watched time, and Remaining time.
  - Checkbox per video to mark as Watched/Not Watched with instant zero-latency feedback.
  - Videos visually update when completed (strike-through and subtle fading).
  - Bulk actions: "Mark All Watched" and "Reset All".
  - Search within playlist videos.
  - Filter by *All*, *Watched*, *Not Watched*, *Has Notes*, *No Notes*.
  - Sort by *Playlist Order*, *Watched First*, *Unwatched First*, *Shortest*, *Longest*.

- **Personal Video Notes**:
  - Every video has its own independent study notes (practice problems, key formulas, reminders).
  - Add, edit, or delete notes with automatic timestamps.
  - Note snippets and badges appear directly on video cards.

- **Embedded YouTube Player Modal**:
  - Watch videos directly within the tracker modal while taking notes without navigating away.

- **Authentication & Security**:
  - Secure registration and login with JWT and `bcryptjs` password hashing.
  - Full user isolation: Each user only accesses their own playlists and notes.
  - Zero plain-text passwords and clean error handling.

- **Flexible Persistence**:
  - **Zero-Config Built-In Storage**: Works out of the box using atomic local persistent storage (`backend/data/db.json`).
  - **MongoDB Ready**: Seamlessly connects to MongoDB or MongoDB Atlas by setting `MONGODB_URI` in `.env`.

---

## Project Structure

```
youtube tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connector (MongoDB + Local file fallback)
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── playlistController.js # Playlist CRUD & YouTube import
│   │   └── videoController.js    # Watch status toggle, notes management, bulk updates
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── errorMiddleware.js    # Clean error handler
│   ├── models/
│   │   ├── User.js               # User data model
│   │   ├── Playlist.js           # Playlist tracker model
│   │   └── Video.js              # Video model with notes and watch state
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── playlistRoutes.js     # /api/playlists
│   │   └── videoRoutes.js        # /api/videos
│   ├── services/
│   │   ├── youtubeService.js     # YouTube Data API v3 integration with pagination
│   │   └── demoDataService.js    # Curated demo playlists for 1-click testing
│   ├── utils/
│   │   ├── durationParser.js     # ISO 8601 duration parser
│   │   └── urlParser.js          # YouTube URL extractor
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx              # Header with logo, user greeting, logout
    │   │   ├── StatsOverview.jsx       # Dashboard aggregate summary cards
    │   │   ├── PlaylistCard.jsx        # Playlist card with progress bar
    │   │   ├── ProgressBar.jsx         # Reusable animated progress bar
    │   │   ├── AddPlaylistModal.jsx    # URL import & 1-click demo import modal
    │   │   ├── RenamePlaylistModal.jsx # Rename tracker modal
    │   │   ├── ConfirmDeleteModal.jsx  # Deletion confirmation modal
    │   │   ├── VideoRow.jsx            # Video list item with checkbox & note triggers
    │   │   ├── NoteEditorModal.jsx     # Personal note editor with timestamps
    │   │   └── VideoPlayerModal.jsx    # Embedded YouTube player modal
    │   ├── context/
    │   │   ├── AuthContext.jsx         # Authentication state & session
    │   │   └── ToastContext.jsx        # Notification toast alerts
    │   ├── pages/
    │   │   ├── Dashboard.jsx           # Main tracker dashboard
    │   │   ├── PlaylistDetail.jsx      # Individual playlist tracking page
    │   │   ├── Login.jsx               # Sign-in page
    │   │   └── Register.jsx            # Sign-up page
    │   ├── services/
    │   │   ├── api.js                  # Axios client with JWT interceptor
    │   │   ├── authService.js
    │   │   ├── playlistService.js
    │   │   └── videoService.js
    │   ├── utils/
    │   │   └── formatters.js           # Duration & date formatting utilities
    │   ├── App.jsx                     # Router & Protected Routes
    │   ├── main.jsx
    │   └── index.css                   # Tailwind styles & dark mode theme
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended; v24.x supported)
- [npm](https://www.npmjs.com/)

---

### Step 1: Install Dependencies

Open a terminal in the root `youtube tracker` directory:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

1. Navigate to the `backend/` folder.
2. Copy `.env.example` to `.env`:

```bash
cd backend
copy .env.example .env     # On Windows Command Prompt / PowerShell
# or: cp .env.example .env  # On macOS / Linux
```

3. Inside `backend/.env`, you can customize:

```ini
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_change_in_production_12345
JWT_EXPIRES_IN=7d

# (Optional) MongoDB Connection: Leave blank to use built-in local persistent storage!
MONGODB_URI=

# (Optional for live URLs) Official YouTube Data API v3 Key
YOUTUBE_API_KEY=
```

---

### Step 3: Run the Application

You can run the backend and frontend in two separate terminal windows:

#### Terminal 1 — Backend:
```bash
cd "C:\Users\HP\Downloads\youtube tracker\backend"
npm start
```
*Backend will run at `http://localhost:5000`.*

#### Terminal 2 — Frontend:
```bash
cd "C:\Users\HP\Downloads\youtube tracker\frontend"
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Database Setup Instructions

### Option A: Zero-Config Built-in Storage (Default)
- No installation required!
- If `MONGODB_URI` in `backend/.env` is empty, the application automatically uses `backend/data/db.json`.
- All users, playlists, videos, watch statuses, and notes are saved persistently on your local computer.

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free shared cluster (M0).
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect** > **Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/youtube_tracker?retryWrites=true&w=majority
   ```
6. Paste this string into `backend/.env` as `MONGODB_URI`.
7. Restart the backend server.

### Option C: Local MongoDB
If you have MongoDB installed locally:
```ini
MONGODB_URI=mongodb://localhost:27017/youtube_tracker
```

---

## YouTube Data API Setup Instructions

To import real playlists from any public YouTube link:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `YouTube Playlist Tracker`).
3. In the search bar at the top, search for **"YouTube Data API v3"** and click **Enable**.
4. In the left navigation, click **APIs & Services** > **Credentials**.
5. Click **+ Create Credentials** > **API key**.
6. Copy your newly created API key.
7. Open `backend/.env` and paste it:
   ```ini
   YOUTUBE_API_KEY=AIzaSy...your_key_here...
   ```
8. Restart your backend server.

> **Note**: If you do not have a YouTube API key yet, you can still test all features immediately! Simply click **"+ Add Playlist"** on the dashboard and choose any of the curated **"Try Curated Demo Playlists"** with 1 click.

---

## How to Test the Application

1. **Sign Up / Login**:
   - Go to `http://localhost:5173/login`.
   - Click **"Click to autofill demo account"** or create a new account via the **"Create an account"** link.
2. **Add a Playlist Tracker**:
   - On the Dashboard, click **"+ Add Playlist"**.
   - Either paste a YouTube playlist link or expand **"Browse Demos"** to import *Striver A2Z DSA* or *Web Development Sigma*.
3. **Track Video Progress**:
   - Click the playlist card to open the playlist detail page.
   - Click the checkmark next to any video. Notice that:
     - The checkbox checks instantly.
     - The video row subtly fades.
     - Watched counter and progress percentage update immediately.
     - The progress bar fills dynamically.
     - Watched time and Remaining time recalculate.
4. **Add Personal Notes**:
   - Click **"Add Note"** on any video.
   - Type notes, formulas, or practice problem references.
   - Click **"Save Note"**. The note badge will display on the video row.
5. **Search & Filter**:
   - Search for keywords in the video search bar.
   - Filter by *Watched*, *Not Watched*, or *Has Notes*.
   - Change sort order (*Shortest*, *Longest*, *Watched First*).
6. **Watch in App**:
   - Click **"Play"** on any video to open the built-in video player.
7. **Multiple Playlists & Isolation**:
   - Go back to Dashboard and add a second playlist.
   - Notice each playlist maintains its own independent progress, video lists, and notes.
8. **Reload / Re-login**:
   - Refresh the browser or log out and log back in. All your tracked data, notes, and progress remain completely intact.