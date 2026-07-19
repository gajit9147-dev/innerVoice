# 📝 InnerVoice

InnerVoice is a beautifully designed, modern web application that allows users to capture, organize, and analyze their thoughts seamlessly. 

Built with a robust full-stack architecture (MySQL, Express, React, Node.js) and styled with Tailwind CSS v4, InnerVoice delivers a blazing fast and visually stunning journaling experience.

## ✨ Features

- **Responsive Design:** Completely fluid UI that works flawlessly on desktop, tablet, and mobile.
- **Dark Mode:** A meticulously crafted dark theme that respects your eyes during late-night journaling sessions.
- **Rich Organization:** Categorize your notes and use the powerful search and filtering system to find exactly what you need instantly.
- **Insights & Analytics:** Track your writing habits, most-used categories, and note frequency over time.
- **Beautiful UI/UX:** Features smooth micro-interactions, toast notifications, skeleton loaders, and entry animations for a premium feel.

## 🚀 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- React Router DOM
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MySQL (Database)
- JWT (Authentication)
- bcrypt (Password Hashing)

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gajit9147-dev/innerVoice.git
   cd innerVoice
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Create a .env file with your MySQL credentials and a JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## 📦 Deployment Instructions

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the project into Vercel, and set the **Root Directory** to `client`.
3. Vercel will automatically detect Vite and run `npm run build`.
4. Add any required frontend environment variables (like the production API URL).
5. Deploy!

### Backend (Render / Railway)
1. Deploy your repository to a Node.js Web Service on Render or Railway.
2. Set the **Root Directory** to `server` or configure the start command to `node server/server.js`.
3. Set your environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).
4. **Crucial:** Update your backend CORS configuration to accept requests specifically from your deployed Vercel frontend URL.
