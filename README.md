# PingChat Web Clone

🟢 **Live Demo:** [https://cartrabbit-task.vercel.app](https://cartrabbit-task.vercel.app)

A full-stack, real-time chat application inspired by WhatsApp Web, built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. This project was developed to demonstrate core full-stack application structure, real-time bidirectional communication, modern dynamic UI/UX, and robust API handling.

## Features Included

- **Authentication** – Register/Login with JWT-based sessions
- **Real-time Messaging** – Instant delivery via Socket.IO WebSockets
- **WebRTC Audio & Video Calling** – Peer-to-peer media streaming with dynamic ringing overlays
- **24-Hour Ephemeral Statuses** – Upload text/image/video stories utilizing MongoDB TTL indexes for auto-deletion
- **Message Reactions** – React to individual messages instantly with a custom emoji tray
- **Call History** – Dedicated timeline showing incoming, outgoing, missed calls, and duration
- **Two-panel Layout** – Modern 3-column architecture with a vertical navigation rail
- **Conversations List** – Shows last message, unread count, timestamps
- **Typing Indicators & Presence** – Live "typing...", "Online", and accurate Last Seen tracking
- **Read Receipts** – Double-check marks (grey/blue) synced instantly
- **Persistent Messages** – All messages and media stored safely in MongoDB Cloudinary
- **Date Dividers** – Groups messages by date (Today, Yesterday, etc.)
- **Responsive Design** – Mobile-friendly with automatic panel switching

> **Note on Local API Routing:** The frontend is already brilliantly configured to automatically fall back to the local backend `http://localhost:5000` out of the box! If you ever need to manually change the paths (for example, to point your local computer to a live backend), you can either define `VITE_API_URL` in a `.env` file, or manually edit the base URLs located inside `frontend/src/services/api.js` and `frontend/src/services/useSocket.js`.

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB Database (Local or MongoDB Atlas)
- Cloudinary Account (for media uploads)

## Environment Variables

To run this project, you will need to add the following environment variables to your `backend/.env` file. Do not commit your actual `.env` file to version control.

### Backend (`backend/.env`)
```env
# Application Setup
PORT=5000
NODE_ENV=development

# Database Setup
MONGO_URI=your_mongodb_connection_string_here

# Authentication
JWT_SECRET=your_super_secret_jwt_string_here

# Cloudinary Setup (Required for media/document uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Application Locally

The project is structured into two main folders: `frontend/` and `backend/`. You will need to spin up both separately.

### 1. Database Setup
Ensure you have your MongoDB server running locally or grab your URI from Neon/MongoDB Atlas and place it in your `backend/.env`.

### 2. Backend Setup
Open a new terminal session, navigate to the `backend` directory, install dependencies, and start the server:
```bash
cd backend
npm install
npm run dev
```
*(The backend should now be running on `http://localhost:5000`)*

### 3. Frontend Setup
Open another terminal session, navigate to the `frontend` directory, install the dependencies, and start the React app:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend should automatically open in your browser, typically on `http://localhost:5173` if using Vite)*

## Project Structure

- `backend/`
  - `controllers/` - Application logic for APIs (Auth, Messages, Users)
  - `models/` - Mongoose schemas (User, Message, Conversation)
  - `routes/` - Express routing definitions
  - `socket/` - Socket.IO configuration and event mapping
  - `utils/` - Helpers (e.g., JWT signing, Cloudinary setup)
- `frontend/`
  - `src/components/` - Reusable UI widgets (MessageBubble, Sidebar, ChatWindow)
  - `src/context/` - Global React contexts (Auth Context)
  - `src/pages/` - Top-level page assemblies
  - `src/services/` - Axios API configurations and Socket listeners

## Contact
Please review the codebase and the accompanying features to verify the fulfillment of all technical constraints outlined in the challenge.
