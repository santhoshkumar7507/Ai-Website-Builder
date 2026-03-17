# ⚡ AI Instant Website Builder

> **Transform Your Ideas into Premium, Production-Ready Websites in Seconds.**

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

AI Instant Website Builder is a world-class application that leverages **Google Gemini AI** and a custom **Dynamic Content Engine** to generate high-end, interactive, and responsive websites from simple text prompts. Whether it's a **Petrol Bunk**, **Mobile Shop**, **College Campus**, or **Garment Factory**, the AI understands the context and builds a complete brand experience.

---

## 🚀 Key Features

-   **🧠 Context-Aware Generation:** Describe any business (Petrol Bunk, Bike Rental, etc.) and the AI selects appropriate themes, copy, and layouts.
-   **🖼️ Intelligent HD Image Engine:** Automatically selects high-definition, topic-relevant imagery from Unsplash for a professional look.
-   **✨ Interactive Component Suite:**
    -   **Glassmorphism Modals:** Professional "Application/Registration" popups on every button click.
    -   **Dynamic Ripple Effects:** Premium visual feedback on all interactions.
    -   **Smooth Anchor Scrolling:** Intelligent navigation that generates and scrolls to sections on the fly.
    -   **3D Parallax Tracking:** Immersive mouse-tracking effects for high-end aesthetics.
-   **⚡ Live Full-Screen Preview:** Instantly "Open in Tab" to view your generated masterpiece in full-screen without file-system delays.
-   **💎 Credit System:** Integrated user authentication and credit management (restored to 999 for developers).
-   **🛠️ Tech Stack:** Built with **React 19**, **Vite**, **Express**, **Tailwind CSS**, and **SQLite**.

---

## 🛠️ Installation & Setup

Follow these steps to run the project locally on your machine:

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd AI-Website-Builder
```

### 3. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=5000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
JWT_SECRET=your_super_secret_key
```

### 4. Setup the Frontend
```bash
cd ../client
npm install
```

---

## 🏃 Run the Application

You need to run **two terminals** simultaneously:

### Terminal 1: Backend Server
```bash
cd server
npx nodemon server.js
```
*Server will start on `http://localhost:5000`*

### Terminal 2: Frontend Client
```bash
cd client
npm run dev
```
*Frontend will start on `http://localhost:5173/builder`*

---

## 📖 Usage Guide

1.  **Login/Register:** Open the app and create an account.
2.  **Enter Prompt:** In the sidebar, type your vision (e.g., *"Create a luxury petrol bunk website with golden accents"*).
3.  **Generate:** Hit the **Generate** button and watch the code appear in the center editor.
4.  **Preview:** View the live preview in the right panel or click **"Open in Tab"** for the full cinematic experience.
5.  **Interact:** Test the navigation links and hit any button to see the **Application Process Modal** in action!

---

## 📂 Project Structure

```text
├── client/              # React + Vite Frontend
│   ├── src/pages/       # Builder, Login, Register, Home
│   └── tailwind.config  # Custom UI Tokens
├── server/              # Express Backend
│   ├── server.js        # AI Logic & Routes
│   ├── db.js            # SQLite Connection
│   └── ai_builder.sqlite # Project/User Database (Note: renamed based on server.js)
└── README.md            # You are here!
```

---

## 🤝 Contribution

We are pushing the boundaries of AI web design. If you have ideas for new interactive modules or better AI prompts, feel free to open a PR!

**Developed by AI Engineering Team 2026**
