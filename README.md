AI Career Hub
An intelligent assistant designed to streamline and optimize the job search process. This application helps users track job applications, tailor resumes to specific roles, and manage their career development efforts with the help of AI.

✨ Current Features
Job Application Tracking: Add and view a list of all your current job applications, with data persisted in a Firestore database.

Real-time UI: The frontend is connected to Firestore with a real-time listener, so data updates automatically across sessions.

Functional Frontend: A clean, responsive dashboard built with React to manage applications.

Python Backend API: A Flask server that connects to the Firestore database and exposes a /jobs endpoint to retrieve all application data.

🚀 Technology Stack
This project is built with a modern, full-stack architecture:

Frontend:

React: A powerful JavaScript library for building user interfaces.

Vite: A next-generation frontend tooling for a fast development experience.

CSS Modules: For locally scoped, conflict-free CSS styling.

Backend:

Python with Flask: A lightweight server that provides a REST API.

Firebase Admin SDK: For secure, server-side access to the database.

Database:

Firestore: A NoSQL database for storing application and user data.

🔧 Getting Started
To get a local copy up and running, you will need to run both the frontend and backend servers.

# Prerequisites
Node.js (LTS version recommended)

Python 3.x

A Google account for Firebase

# Installation & Setup
Clone the repo

git clone https://github.com/YourUsername/ai-career-hub.git

# Setup Firebase

Create a Firebase project and a Firestore database in "test mode".

Generate a private key file (a .json service account file) from your Firebase project settings.

Place the downloaded JSON key file inside the backend/ directory.

Important: Add the name of your .json key file to your main .gitignore file to keep it secure (e.g., *.json).

# Setup Frontend (in a new terminal)

cd ai-career-hub
npm install
npm run dev

Your React app should now be running on http://localhost:5173.

# Setup Backend (in a second terminal)

cd ai-career-hub/backend

# Create a virtual environment
python -m venv venv

# Activate it
source venv/Scripts/activate

# Install Python packages
pip install Flask Flask-Cors firebase-admin google-cloud-firestore python-dotenv

# Run the server
python app.py

Your Python backend should now be running on http://localhost:5001.

Roadmap
[ ] Integrate the Gemini API for AI-powered resume tailoring.

[ ] Create a new API endpoint in the backend to handle AI requests.

[ ] Connect the React frontend to the new AI endpoint.

[ ] Add user authentication.

[ ] Implement cover letter generation.

This project is being built with the assistance of Google's Gemini.