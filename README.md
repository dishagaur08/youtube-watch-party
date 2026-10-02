# WatchTogether

Watch YouTube together in real time.

---

## 🌐 Live Demo & Repository

- **Frontend:** [https://youtube-watch-party-1-xep4.onrender.com](https://youtube-watch-party-1-xep4.onrender.com?utm_source=chatgpt.com)
- **Backend / API:** [https://youtube-watch-party-cfvx.onrender.com](https://youtube-watch-party-cfvx.onrender.com)
- **GitHub:** [https://github.com/dishagaur08/youtube-watch-party](https://github.com/dishagaur08/youtube-watch-party)

---

## 🎬 Features & Requirements Checklist

- [x] **Room Creation & Joining**: Create custom rooms or join with unique codes / shareable links (`/watch?room=ROOM_CODE`).
- [x] **YouTube IFrame API Integration**: Fully embedded YouTube player synced across all connected room viewers.
- [x] **Real-Time Playback Synchronization**: Zero-drift play and pause broadcasts.
- [x] **Seek Scrub Synchronization**: Live seek scrubbing across participants with anti-echo protection (1.5s drift tolerance).
- [x] **Dynamic Video Switching**: Host and Moderators can change the active YouTube video in real time via URL or Video ID.
- [x] **Role-Based Access Control (RBAC)**:
  - **Host** (Room Creator): Full playback controls, assign/revoke Moderator roles, kick participants, transfer host role.
  - **Moderator**: Full playback controls (play, pause, seek, change video).
  - **Participant**: Synced view-only mode; UI controls locked with permission enforcement.
- [x] **Server-Side Security**: WebSocket handlers strictly validate roles before processing `play`, `pause`, `seek`, `change_video`, `assign_role`, and `remove_participant`.
- [x] **Interactive Participant List**: Live participant roster displaying usernames, role badges (Host, Moderator, Participant), and host action buttons.
- [x] **Live Room Chat & Floating Emoji Reactions**: Synchronized real-time messaging with role tags and live flying emoji reactions.
- [x] **OOP Server Architecture**: Encapsulated `Participant`, `WatchRoom`, and `WatchRoomManager` models.

---

## 📐 Architecture Overview & WebSocket Protocol

```
                               ┌──────────────────────────────────────────────┐
                               │             React + Vite Frontend            │
                               │  ┌────────────────────┐ ┌──────────────────┐ │
                               │  │ YouTube IFrame API │ │ Participant List │ │
                               │  │ (State & Seek Sync)│ │  & RBAC Controls │ │
                               │  └─────────▲──────────┘ └────────▲─────────┘ │
                               │            │                     │           │
                               │            └──────────┬──────────┘           │
                               │                       │                      │
                               └───────────────────────┼──────────────────────┘
                                                       │ Socket.IO / WebSockets
                                                       ▼
                               ┌──────────────────────────────────────────────┐
                               │           Node.js / Express Backend          │
                               │  ┌────────────────────────────────────────┐  │
                               │  │        watchPartySockets Handler       │  │
                               │  │  - join_room, play, pause, seek        │  │
                               │  │  - change_video, assign_role, remove   │  │
                               │  └───────────────────▲────────────────────┘  │
                               │                      │                       │
                               │  ┌───────────────────┴────────────────────┐  │
                               │  │           OOP Domain Model             │  │
                               │  │   WatchRoomManager ──► WatchRoom       │  │
                               │  │       │                                │  │
                               │  │       └─► Participant (Role Enforcement)│  │
                               │  └────────────────────────────────────────┘  │
                               └──────────────────────────────────────────────┘
```

### WebSocket Events Protocol

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client ➔ Server | `{ roomId, username, userId, avatar }` | User joins room. Creator becomes Host, subsequent joiners become Participant. |
| `leave_room` | Client ➔ Server | `{ roomId }` | User leaves the room. |
| `sync_state` | Server ➔ Clients | `{ roomId, title, videoId, playState, currentTime, role, participants }` | Broadcasts current video playback state and participant list. |
| `play` | Client ➔ Server | `{}` | Requires **Host** or **Moderator**. Server sets state to PLAYING and broadcasts `sync_state`. |
| `pause` | Client ➔ Server | `{ currentTime }` | Requires **Host** or **Moderator**. Server sets state to PAUSED and broadcasts `sync_state`. |
| `seek` | Client ➔ Server | `{ time }` | Requires **Host** or **Moderator**. Server updates timeline and broadcasts `sync_state`. |
| `change_video` | Client ➔ Server | `{ videoId }` | Requires **Host** or **Moderator**. Server switches active YouTube video and resets playback. |
| `assign_role` | Client ➔ Server | `{ userId, role }` | Requires **Host**. Promotes/demotes user to Moderator or Participant. |
| `remove_participant` | Client ➔ Server | `{ userId }` | Requires **Host**. Removes participant from the party. |
| `user_joined` | Server ➔ Clients | `{ username, userId, role, participants }` | Broadcasted when a new user enters. |
| `user_left` | Server ➔ Clients | `{ username, userId, participants }` | Broadcasted when a user disconnects or leaves. |
| `role_assigned` | Server ➔ Clients | `{ userId, username, role, participants }` | Broadcasted when a participant's role changes. |
| `participant_removed`| Server ➔ Clients | `{ userId, participants }` | Broadcasted when a participant is kicked. |
| `room_chat_message` | Client ➔ Server ➔ Clients | `{ message, username, role, timestamp }` | Live room chat broadcast. |
| `room_reaction` | Client ➔ Server ➔ Clients | `{ emoji, username }` | Floating reaction broadcast. |

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9+)

### 2. Installation

```bash
# Clone repository
git clone https://github.com/dishagaur08/youtube-watch-party.git
cd youtube-watch-party

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 3. Running Locally

**Start Backend Server:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Start Frontend Client:**
```bash
cd client
npm run dev
# Client running at http://localhost:5173
```

---

## 🧪 Testing

Run the automated backend test suite (including WebSocket protocol, RBAC verification, and multi-user room sync):

```bash
cd server
npm test
```

---

## 🌐 Deployment to Render

### Backend Web Service (Render)
- **Live URL:** [https://youtube-watch-party-cfvx.onrender.com](https://youtube-watch-party-cfvx.onrender.com)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and configure:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
3. Add Environment Variables:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://youtube-watch-party-1-xep4.onrender.com`

### Frontend Static Site (Render / Vercel)
- **Live URL:** [https://youtube-watch-party-1-xep4.onrender.com](https://youtube-watch-party-1-xep4.onrender.com?utm_source=chatgpt.com)
1. Create a new **Static Site** on [Render](https://render.com).
2. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL`: `https://youtube-watch-party-cfvx.onrender.com`
