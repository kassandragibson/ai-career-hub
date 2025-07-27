import os
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

# --- Firebase Initialization ---
# Get the absolute path to the directory this file is in
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Construct the path to your service account key file
# IMPORTANT: Replace 'your-service-account-file.json' with the actual name of your downloaded key file.
SERVICE_ACCOUNT_KEY_PATH = os.path.join(BASE_DIR, 'ai-career-hub-55b4a-firebase-adminsdk-fbsvc-3441341585.json')

# Initialize the Firebase Admin SDK
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # Exit or handle the error appropriately if Firebase can't be initialized
    exit()

# Get a reference to the Firestore database
db = firestore.client()
# --- End of Firebase Initialization ---


# --- Flask App Initialization ---
app = Flask(__name__)
# Enable CORS for all routes, allowing our React app to make requests
CORS(app)
# --- End of Flask App Initialization ---


# --- API Routes ---
@app.route("/")
def hello_world():
    return "<p>Hello from the Python Backend!</p>"

# New route to get all job applications
@app.route("/jobs", methods=['GET'])
def get_jobs():
    try:
        # Get a reference to the 'jobs' collection
        jobs_ref = db.collection('jobs')
        # Get all documents in the collection
        docs = jobs_ref.stream()

        # Format the documents into a list of dictionaries
        jobs_list = []
        for doc in docs:
            job_data = doc.to_dict()
            job_data['id'] = doc.id # Add the document ID
            jobs_list.append(job_data)
        
        # Return the list as a JSON response
        return jsonify(jobs_list), 200

    except Exception as e:
        # Return an error message if something goes wrong
        return jsonify({"error": str(e)}), 500

# --- End of API Routes ---


# This allows us to run the app directly with 'python app.py'
if __name__ == '__main__':
    # Use port 5001 to avoid conflict with React's default port
    app.run(debug=True, port=5001)
