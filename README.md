<div align="center">

# 🎓 Planify

### Graduation Project Collaboration Platform

**A full-stack web application designed for university students and supervisors to collaborate on graduation projects — with real-time chat, Kanban task boards, repository management, and powerful analytics dashboards.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101.svg)](https://socket.io/)

---

![Dashboard](docs/screenshots/dashboard.png)

![Team Workspace](docs/screenshots/team-workspace.png)

![Task Board](docs/screenshots/task-board.png)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [API Overview](#api-overview)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgements](#acknowledgements)

---

## 🧠 About

Planify streamlines the graduation project lifecycle by providing a centralized workspace where student teams and their supervisors can collaborate effectively. From task management and real-time communication to file sharing and progress tracking — Planify covers every aspect of the graduation project journey.

**Built for:**
- 🎓 University students working on graduation/capstone projects
- 👨‍🏫 Academic supervisors overseeing multiple student teams
- 🏫 Computer Science, Engineering, and related departments

**Key Benefits:**
- All-in-one collaboration platform replacing scattered tools
- Real-time communication with instant messaging and typing indicators
- Visual project tracking with Kanban boards and progress dashboards
- Supervisor oversight with analytics across multiple teams
- Modern, responsive UI with dark/light theme support

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure registration with university ID, department, and email
- JWT-based authentication with persistent sessions
- Role-based access control (Student / Supervisor)
- Supervisor account approval workflow
- Password hashing with bcrypt

### 👥 Team Management
- Create a team and become the team leader
- Join teams via unique 6-character invite codes
- Member roles: Leader, Co-Leader, Member
- Remove members (leader only)
- Assign supervisors to teams
- Project phase tracking (Proposal → Design → Development → Testing → Final)
- Team milestones with due dates and completion tracking

### 📋 Kanban Task Board
- Five-column board: Backlog, To Do, In Progress, Testing, Completed
- Drag-and-drop task management powered by @hello-pangea/dnd
- Task priority levels: Low, Medium, High, Urgent
- Task assignment to team members
- Due date tracking with overdue indicators
- Task labels for categorization
- Task creation with modal form

### 💬 Real-Time Chat
- Team-based messaging with Socket.io
- Live typing indicators
- Message reactions (👍 ❤️ 😂 😮)
- Edit and delete your own messages
- Reply-to messaging support
- File and image sharing (up to 10MB)
- Message delivery confirmation indicators

### 📁 Repository Management
- File upload and management (up to 20MB per file)
- Commit history tracking with author attribution
- Markdown README editor with live preview
- Documentation section for notes and progress updates
- Meeting summaries with date and author tracking

### 📅 Calendar
- Monthly calendar view with task deadline visualization
- Color-coded task indicators by priority
- Click-to-expand day details showing all tasks
- Upcoming deadlines sidebar with overdue alerts

### 🔔 Notifications
- Multi-type notifications: task assignments, updates, commits, team invites, deadlines, milestones, messages, member joins, announcements
- Mark individual or all notifications as read
- Filter between All / Unread views
- Unread count badge
- Relative timestamps (e.g., "5m ago", "2h ago")

### 📊 Supervisor Dashboard
- Overview of all assigned teams with key statistics
- Team selector with animated transitions
- Per-team task distribution pie chart
- Team comparison bar chart (Members vs Progress)
- Completion rate tracking
- Team details: status, phase, progress, member list

### 🎨 Modern UI/UX
- Dark and light theme toggle with system preference detection
- Smooth page transitions and micro-interactions (Framer Motion)
- Responsive sidebar with collapse/expand
- Skeleton loading states
- Glass morphism design elements
- Custom gradient design system
- Mobile-friendly responsive layout
- Collapsible sidebar with tooltips

### ⚡ Real-Time Infrastructure
- Socket.io-powered real-time events
- Online users tracking
- Live message delivery and updates
- Voice channel events (join/leave/mute indicators)
- WebRTC signaling infrastructure for peer connections
- Task update broadcasting

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://reactjs.org/) | UI framework |
| [Vite 5](https://vitejs.dev/) | Build tool and dev server |
| [React Router DOM 6](https://reactrouter.com/) | Client-side routing |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag-and-drop for Kanban board |
| [Recharts](https://recharts.org/) | Charts and data visualization |
| [React Markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library |
| [Socket.io Client](https://socket.io/) | Real-time communication |
| [Axios](https://axios-http.com/) | HTTP client |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express.js](https://expressjs.com/) | Web framework |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [Socket.io](https://socket.io/) | Real-time WebSocket server |
| [JSON Web Token](https://jwt.io/) | Authentication tokens |
| [bcryptjs](https://github.com/nicedoc/bcrypt.js) | Password hashing |
| [Multer](https://github.com/expressjs/multer) | File upload handling |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |
| [CORS](https://github.com/expressjs/cors) | Cross-origin resource sharing |

### Database

| Technology | Purpose |
|---|---|
| [MongoDB](https://www.mongodb.com/) | NoSQL document database |

### Development

| Technology | Purpose |
|---|---|
| [Nodemon](https://nodemon.io/) | Auto-restart server on changes |
| [PostCSS](https://postcss.org/) | CSS processing |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS vendor prefixing |

---

## 🏗 Architecture

```
Planify/
├── backend/                        # Backend API server
│   ├── config/
│   │   └── database.js             # MongoDB connection setup
│   ├── controllers/                # Route handlers
│   │   ├── authController.js       # Authentication (register, login, profile)
│   │   ├── teamController.js       # Team CRUD, membership, milestones
│   │   ├── taskController.js       # Task CRUD and status management
│   │   ├── messageController.js    # Chat messaging and file uploads
│   │   ├── repositoryController.js # File management, commits, docs
│   │   └── notificationController.js # Notification system
│   ├── middleware/
│   │   ├── auth.js                 # JWT auth, role-based guards
│   │   └── errorHandler.js         # Centralized error handling
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # User model (student/supervisor)
│   │   ├── Team.js                 # Team model with members & milestones
│   │   ├── Task.js                 # Task model with status & priority
│   │   ├── Message.js              # Chat message model with reactions
│   │   ├── Repository.js           # Repository with files & commits
│   │   └── Notification.js         # Notification model
│   ├── routes/                     # API route definitions
│   │   ├── auth.js
│   │   ├── teams.js
│   │   ├── tasks.js
│   │   ├── messages.js
│   │   ├── repositories.js
│   │   └── notifications.js
│   ├── sockets/
│   │   └── index.js                # Socket.io event handlers
│   ├── services/                   # Business logic services
│   ├── utils/                      # Utility functions
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables
│
├── frontend/                       # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── calendar/           # Calendar components
│   │   │   ├── chat/               # Chat UI components
│   │   │   ├── common/             # Sidebar, TopBar, Logo
│   │   │   ├── dashboard/          # Stat cards and dashboard widgets
│   │   │   ├── notifications/      # Notification components
│   │   │   ├── profile/            # Profile components
│   │   │   ├── repositories/       # Repository components
│   │   │   ├── search/             # Search components
│   │   │   ├── supervisor/         # Supervisor-specific components
│   │   │   ├── tasks/              # Task board components
│   │   │   ├── team/               # Team management components
│   │   │   └── voice/              # Voice channel components
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx     # Dark/light theme provider
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx       # App shell with sidebar
│   │   ├── pages/                   # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Repository.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── SupervisorDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance with interceptors
│   │   │   └── socket.js           # Socket.io client setup
│   │   ├── stores/
│   │   │   ├── useAuthStore.js      # Authentication state (Zustand)
│   │   │   ├── useTaskStore.js      # Task state management
│   │   │   └── useTeamStore.js      # Team state management
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles & Tailwind layers
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/gradhub.git
cd gradhub
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Backend Setup

```bash
cd backend
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gradhub
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
```

Start the backend server:

```bash
npm run dev
```

The API server will start on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000` with automatic proxying to the backend.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Server port number | `5000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/gradhub` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | — | Yes |
| `JWT_EXPIRE` | Token expiration duration | `7d` | No |
| `UPLOAD_PATH` | File upload directory | `./uploads` | No |

### Frontend (`frontend/.env`)

| Variable | Description | Default | Required |
|---|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api` | No |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` | No |

> **⚠️ Security Note:** Never commit `.env` files or expose secret keys. Add `.env` to your `.gitignore`.

---

## 📖 Usage Guide

### Registration & Login
1. Navigate to the registration page and fill in your details (name, email, password, university ID, department).
2. Students are auto-approved upon registration.
3. Supervisor accounts require admin approval before login.
4. Sign in with your email and password to access the dashboard.

### Creating a Team
1. Navigate to the **Team** page.
2. Click **Create Team** and enter a team name and description.
3. You will automatically become the team leader.
4. Share the generated **invite code** with classmates.

### Joining a Team
1. Get the 6-character invite code from your team leader.
2. Navigate to the **Team** page and click **Join Team**.
3. Enter the invite code to join.

### Managing Tasks
1. Navigate to the **Tasks** page to view the Kanban board.
2. Click **Add Task** to create a new task with title, description, priority, assignee, and due date.
3. Drag and drop tasks between columns to update their status.
4. Click the ⋯ menu on a task card to delete it.

### Using Chat
1. Navigate to the **Chat** page.
2. Send messages in real-time to your team.
3. See typing indicators when others are composing.
4. React to messages with emojis, or edit/delete your own.

### Repository & Documentation
1. Navigate to the **Repository** page.
2. Upload files under the **Files** tab.
3. Create commits with descriptive messages under the **Commits** tab.
4. Edit your team's README with Markdown support under the **README** tab.
5. Maintain project notes and meeting summaries under the **Docs** tab.

### Calendar View
1. Navigate to the **Calendar** page.
2. View tasks mapped to their due dates on a monthly calendar.
3. Click on a day to see all tasks due.
4. Check the **Upcoming** sidebar for the next deadlines.

### Supervisor Features
1. Navigate to the **Supervisor** page (visible in sidebar for supervisors).
2. View all your assigned teams in one dashboard.
3. Select teams to view detailed stats, member lists, and task distribution charts.
4. Compare teams side-by-side using the comparison bar chart.

---

## 🌐 API Overview

All endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update user profile | Yes |

### Teams (`/api/teams`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/teams` | Get all teams (supervised or all) | Yes |
| `POST` | `/api/teams` | Create a new team | Yes |
| `POST` | `/api/teams/join` | Join a team via invite code | Yes |
| `GET` | `/api/teams/my` | Get user's current team | Yes |
| `GET` | `/api/teams/:id` | Get team details | Yes |
| `PUT` | `/api/teams/:id` | Update team (leader only) | Yes |
| `POST` | `/api/teams/:id/invite` | Get invite code (leader only) | Yes |
| `DELETE` | `/api/teams/:id/members/:memberId` | Remove member (leader only) | Yes |
| `POST` | `/api/teams/:id/supervisor` | Assign supervisor (leader only) | Yes |
| `POST` | `/api/teams/:id/milestones` | Add a milestone | Yes |
| `PUT` | `/api/teams/:id/milestones/:milestoneId/complete` | Complete a milestone | Yes |

### Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/tasks/:teamId` | Get tasks for a team | Yes |
| `POST` | `/api/tasks/:teamId` | Create a task | Yes |
| `PUT` | `/api/tasks/:id` | Update a task | Yes |
| `PATCH` | `/api/tasks/:id/status` | Update task status (drag-drop) | Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task | Yes |

### Messages (`/api/messages`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/messages/:teamId` | Get messages for a team | Yes |
| `POST` | `/api/messages/:teamId` | Send a message | Yes |
| `PUT` | `/api/messages/:id` | Edit a message | Yes |
| `DELETE` | `/api/messages/:id` | Delete a message | Yes |
| `POST` | `/api/messages/:id/reactions` | Add/remove reaction | Yes |
| `POST` | `/api/messages/:teamId/upload` | Upload file message | Yes |

### Repositories (`/api/repositories`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/repositories/:teamId` | Get team repository | Yes |
| `POST` | `/api/repositories/:teamId/commits` | Create a commit | Yes |
| `PUT` | `/api/repositories/:teamId/readme` | Update README | Yes |
| `PUT` | `/api/repositories/:teamId/docs` | Update documentation | Yes |
| `POST` | `/api/repositories/:teamId/meetings` | Add meeting summary | Yes |
| `POST` | `/api/repositories/:teamId/files` | Upload a file | Yes |
| `DELETE` | `/api/repositories/:teamId/files/:fileId` | Delete a file | Yes |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | Get user notifications | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all as read | Yes |

### Health Check

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Server health check | No |

---

## 🔒 Security

- **JWT Authentication:** All protected routes require a valid Bearer token in the `Authorization` header.
- **Password Hashing:** Passwords are hashed using bcrypt with a salt factor of 10 before storage.
- **Role-Based Access:** Middleware enforces supervisor-only and team-leader-only routes.
- **Input Validation:** Mongoose schema validation on all models with required fields, max lengths, and regex patterns.
- **Error Handling:** Centralized error handler that safely formats responses without leaking internal details.
- **CORS Configuration:** Configured to allow specific origins (`localhost:5173`, `localhost:3000`).
- **File Upload Limits:** Multer enforces file size limits (10MB for chat uploads, 20MB for repository files).
- **Token Expiration:** JWT tokens expire after 7 days by default.
- **Auto-Logout:** Frontend intercepts 401 responses and clears stored credentials.

---

## 🗺 Future Improvements

- [ ] **Video/Audio Meetings** — WebRTC-powered video conferencing for team meetings
- [ ] **Mobile Application** — React Native mobile app for iOS and Android
- [ ] **AI-Powered Insights** — Smart task prioritization and project health analysis
- [ ] **Gantt Chart View** — Timeline visualization for project planning
- [ ] **Email Notifications** — Email alerts for critical deadlines and assignments
- [ ] **File Versioning** — Track file change history and diffs
- [ ] **Search & Filtering** — Full-text search across messages, tasks, and files
- [ ] **Export Reports** — PDF and CSV export of team progress and analytics
- [ ] **SSO Integration** — University single sign-on (LDAP/SAML) support
- [ ] **Activity Log** — Comprehensive audit trail of all team actions
- [ ] **Dark Mode Scheduling** — Automatic theme switching based on time of day
- [ ] **Multi-Language Support** — Internationalization for global usage

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes before submitting
- Update documentation if adding new features
- Keep pull requests focused on a single change

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Planify** — Built as a graduation project collaboration platform.

| | |
|---|---|
| 📧 Email | your-email@example.com |
| 💼 LinkedIn | [Your LinkedIn](https://linkedin.com/in/your-profile) |
| 🐙 GitHub | [@your-username](https://github.com/your-username) |

---

## 🙏 Acknowledgements

- [React](https://reactjs.org/) — A JavaScript library for building user interfaces
- [Express.js](https://expressjs.com/) — Fast, unopinionated web framework for Node.js
- [MongoDB](https://www.mongodb.com/) — The world's most popular document database
- [Socket.io](https://socket.io/) — Real-time bidirectional event-based communication
- [Tailwind CSS](https://tailwindcss.com/) — A utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) — Production-ready motion library for React
- [Recharts](https://recharts.org/) — Composable charting library built on React
- [Zustand](https://github.com/pmndrs/zustand) — Bear necessities for state management in React
- [Vite](https://vitejs.dev/) — Next generation frontend tooling
- [Mongoose](https://mongoosejs.com/) — Elegant MongoDB object modeling for Node.js

---

<div align="center">

**Made with ❤️ for university students worldwide**

</div>