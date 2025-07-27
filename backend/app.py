import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import google.generativeai as genai

# --- Initialization ---
load_dotenv()

# --- Firebase Initialization ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_KEY_PATH = os.path.join(BASE_DIR, 'ai-career-hub-55b4a-firebase-adminsdk-fbsvc-3441341585.json')

try:
    # Check if the app is already initialized to prevent errors on reload
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    exit()

db = firestore.client()

# --- Gemini API Initialization ---
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    exit()

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- API Routes ---
@app.route("/analyze", methods=['POST'])
def analyze_resume():
    try:
        data = request.get_json()
        job_id = data.get('jobId')
        resume_text = data.get('resumeText')

        if not job_id or not resume_text:
            return jsonify({"error": "jobId and resumeText are required"}), 400

        job_doc_ref = db.collection('jobs').document(job_id)
        job_doc = job_doc_ref.get()

        if not job_doc.exists:
            return jsonify({"error": "Job not found"}), 404

        job_description = job_doc.to_dict().get('jobDescription')

        prompt = f"""
        Analyze the following resume and job description. Provide specific, actionable feedback on how to tailor the resume to better match the job description. 
        Focus on identifying missing keywords, suggesting alternative phrasing for experience, and highlighting the most relevant skills.

        The output should be a JSON object with two keys: "summary" and "suggestions".
        - "summary" should be a short, overall assessment.
        - "suggestions" should be an array of strings, where each string is a concrete suggestion.

        **Job Description:**
        ---
        {job_description}
        ---

        **Resume:**
        ---
        {resume_text}
        ---
        """

        response = model.generate_content(prompt)
        
        # --- FIX: Clean and parse the response from the AI ---
        raw_text = response.text
        # Find the start and end of the JSON block to remove markdown
        json_start = raw_text.find('{')
        json_end = raw_text.rfind('}') + 1
        
        if json_start != -1 and json_end != 0:
            clean_json_string = raw_text[json_start:json_end]
            # Parse the clean string into a Python dictionary
            parsed_json = json.loads(clean_json_string)
            # Return the dictionary as a JSON response
            return jsonify(parsed_json), 200
        else:
            # If we can't find JSON, return an error
            return jsonify({"error": "Failed to parse AI response."}), 500

    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"error": str(e)}), 500

# Other routes (get_jobs, etc.) can remain the same
@app.route("/jobs", methods=['GET'])
def get_jobs():
    try:
        jobs_ref = db.collection('jobs')
        docs = jobs_ref.stream()
        jobs_list = []
        for doc in docs:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs_list.append(job_data)
        return jsonify(jobs_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
