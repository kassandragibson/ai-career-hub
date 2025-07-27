# AI Career Hub

An intelligent, full-stack application designed to streamline and optimize the job search process. This application empowers users to track their job applications and leverage the power of Google's Gemini API to receive AI-driven feedback on how to tailor their resumes for specific roles.

![AI Career Hub Screenshot](https://placehold.co/800x450/e2e8f0/334155?text=App+Screenshot+Here)
*(Suggestion: Replace the placeholder above with a screenshot or GIF of your application in action!)*

---

## ✨ Core Features

* **Job Application Tracking:** Add and view a list of all your current job applications. All data is persisted in a secure, cloud-based Firestore database.
* **Real-time UI:** The frontend is connected to Firestore with a real-time listener, so data updates automatically across sessions.
* **AI-Powered Resume Analysis:** For any saved job, users can paste their resume text and receive instant, actionable feedback from the Gemini API on how to improve it.
* **Full-Stack Architecture:** A complete separation of concerns between the React frontend and the Python (Flask) backend, which communicate via a REST API.

## 🚀 Technology Stack

This project is built with a modern, full-stack architecture:

* **Frontend:**
    * **[React](https://reactjs.org/)**: A powerful JavaScript library for building the user interface.
    * **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling for a fast and efficient development experience.
    * **[CSS Modules](https://github.com/css-modules/css-modules)**: For locally scoped, conflict-free component styling.
* **Backend:**
    * **[Python](https://www.python.org/)** with **[Flask](https://flask.palletsprojects.com/)**: A lightweight server that provides a REST API for the frontend.
    * **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)**: For secure, server-side access to the database.
* **Database:**
    * **[Firestore](https://firebase.google.com/docs/firestore)**: A scalable NoSQL database for storing all application and user data.
* **AI Integration:**
    * **[Google Gemini API](https://ai.google.dev/)**: The core AI engine used for resume analysis and suggestion generation.

## 🔧 Getting Started

To get a local copy up and running, you will need to run both the frontend and backend servers.

### Prerequisites

* Node.js (LTS version recommended)
* Python 3.x
* A Google account for Firebase and Google AI Studio

### Installation & Setup

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/YourUsername/ai-career-hub.git](https://github.com/YourUsername/ai-career-hub.git)
    ```
2.  **Setup Firebase**
    * Create a Firebase project and a Firestore database in "test mode".
    * Generate a private key file (a `.json` service account file) from your Firebase project settings (`Service accounts` tab).
    * Place the downloaded JSON key file inside the `backend/` directory.

3.  **Setup Environment Variables**
    * Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
    * In the `backend/` directory, create a file named `.env`.
    * Add your Gemini API key to the `.env` file:
        ```
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```
    * **Important:** Add the `.json` key file and the `.env` file to your main `.gitignore` file to keep your credentials secure:
        ```
        # .gitignore
        *.json
        .env
        ```

4.  **Setup Frontend** (in a new terminal)
    ```sh
    cd ai-career-hub
    npm install
    npm run dev
    ```
    * Your React app should now be running on `http://localhost:5173`.

5.  **Setup Backend** (in a second terminal)
    ```sh
    cd ai-career-hub/backend
    
    # Create and activate a virtual environment
    python -m venv venv
    source venv/Scripts/activate
    
    # Install Python packages
    pip install -r requirements.txt 
    # (Note: You should create a requirements.txt file with 'pip freeze > requirements.txt')
    
    # Run the server
    python app.py
    ```
    * Your Python backend should now be running on `http://localhost:5001`.

## Roadmap

With the core functionality complete, future enhancements could include:

* [ ] **User Authentication:** Allow multiple users to securely manage their own job applications.
* [ ] **Save Analysis History:** Store past resume analyses in Firestore to track improvements over time.
* [ ] **Automated Cover Letter Generation:** Use the job description and tailored resume to generate a first draft of a cover letter.
* [ ] **UI/UX Enhancements:** Add more detailed status tracking (e.g., "Interviewing", "Offer") and data visualizations.

---

_This project was built with the assistance of Google's Gemini._
