# FocusFlow

FocusFlow is a full-stack productivity app for setting and tracking personal goals. Users create goals, break them into milestones, and schedule recurring tasks that are placed automatically on a calendar. A conflict-aware scheduling engine assigns tasks to available time slots within a configurable wakeup–bedtime window.

## Tech Stack

### Client
- **React 19** with **TypeScript** and **Vite**
- **React Router v7** for navigation
- **Material UI v5** (MUI) + MUI X Date Pickers
- **Zustand** for client-side state management
- **Axios** for HTTP requests
- **date-fns** for date utilities
- **dnd-kit** for drag-and-drop

### Server
- **Node.js** with **Express 5**
- **MongoDB** via **Mongoose**
- **JSON Web Tokens** (jsonwebtoken) for auth
- **bcryptjs** for password hashing
- **dotenv** for environment config
- **date-fns** for date utilities

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A running **MongoDB** instance (local or Atlas)

## Installation

Clone the repository, then install dependencies for both the server and client:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Environment Variables

The server requires a `.env` file in the `server/` directory. Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable        | Description                                              | Example                          |
|-----------------|----------------------------------------------------------|----------------------------------|
| `MONGO_URI`     | MongoDB connection string                                | `mongodb://localhost:27017/focusflow` |
| `JWT_SECRET`    | Secret key used to sign and verify JWTs                  | `supersecretkey`                 |
| `JWT_EXPIRES_IN`| Token expiry duration (optional, defaults to `7d`)       | `7d`                             |
| `PORT`          | Port the server listens on (optional, defaults to `3000`)| `3000`                           |

## Running Locally

### Start the server

```bash
cd server
npm run dev     # uses nodemon for auto-reload
# or
npm start       # plain node
```

The server starts on `http://localhost:3000` by default.

### Start the client

```bash
cd client
npm run dev
```

The client dev server starts on `http://localhost:5173` by default (Vite).

Open your browser to the client URL to use the app.
