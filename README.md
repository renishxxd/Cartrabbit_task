# 💬 WhatsApp Web Clone (Full Stack MERN App)

🟢 **Live Demo:** [https://cartrabbit-task.vercel.app](https://cartrabbit-task.vercel.app)

## 📌 Project Overview

This project is a simplified **WhatsApp Web Clone** built as part of a full-stack developer task. It demonstrates core chat functionality including real-time messaging, user authentication, and persistent data storage.

The application follows a **MERN stack architecture** and implements both frontend and backend systems with real-time communication using Socket.IO.

---

## 🚀 Features

### 🔐 User Authentication

* User registration and login
* JWT-based authentication
* Unique user identification

### 💬 Chat System

* One-to-one messaging
* Real-time message updates (Socket.IO)
* Persistent message storage (MongoDB)
* Chronological message display
* Auto-scroll to latest messages

### 🖥️ UI Interface

* Two-panel layout (Chat list + Chat window)
* Distinct sent/received messages
* Responsive design

### ⚡ Additional Features (Bonus)

* Group chats
* Status updates
* File/image sharing (Cloudinary)
* Basic call functionality

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.IO

---

## 📁 Project Structure

```
Cartrabbit_task/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── index.html
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/whatsapp-clone.git
cd whatsapp-clone
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` file in `/backend`

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Run Backend

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

#### Create `.env` file in `/frontend`

```
VITE_API_URL=http://localhost:5000
```

#### Run Frontend

```bash
npm run dev
```

---

## 🌐 Usage

1. Register or login with two different users
2. Start a conversation
3. Send messages in real-time
4. Refresh page → messages persist

---

## 📡 API Endpoints (Sample)

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Messages

* `POST /api/messages`
* `GET /api/messages/:chatId`

### Users

* `GET /api/users`

---

## ⚠️ Notes

* Ensure MongoDB is running or use MongoDB Atlas
* Add proper environment variables before running
* Do not commit `.env` or secret files

---

## 🧪 Future Improvements

* Input validation and error handling improvements
* Message pagination
* Typing indicators
* Read receipts
* Better UI/UX enhancements

---

## 👨‍💻 Author

**Renish**

* GitHub: https://github.com/renishxxd
* Portfolio: https://renishxxd.github.io

---

## 📄 License

This project is for educational and evaluation purposes only.
