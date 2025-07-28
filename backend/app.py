import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime

# --- Initialization ---
load_dotenv()

# --- Firebase Initialization ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_KEY_PATH = os.path.join(BASE_DIR, 'ai-career-hub-55b4a-firebase-adminsdk-fbsvc-3441341585.json')

try:
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

# --- Helper Function to Clean AI Response ---
def clean_ai_response(raw_text):
    json_start = raw_text.find('{')
    json_end = raw_text.rfind('}') + 1
    if json_start != -1 and json_end != 0:
        clean_json_string = raw_text[json_start:json_end]
        return json.loads(clean_json_string)
    return None

# --- API Routes ---
@app.route("/analyze", methods=['POST'])
def analyze_resume():
    try:
        data = request.get_json()
        user_id, job_id, resume_text = data.get('userId'), data.get('jobId'), data.get('resumeText')

        if not all([user_id, job_id, resume_text]):
            return jsonify({"error": "userId, jobId, and resumeText are required"}), 400

        job_doc_ref = db.collection('users', user_id, 'jobs').document(job_id)
        job_doc = job_doc_ref.get()
        if not job_doc.exists:
            return jsonify({"error": "Job not found"}), 404
        job_description = job_doc.to_dict().get('jobDescription')

        prompt = f"""
        Act as an expert career coach and professional resume writer. Your task is to rewrite the provided resume to be perfectly tailored for the provided job description.
        The final output MUST be a JSON object with a single key: "rewritten_resume". The value should be a single string containing the full text of the newly edited and tailored resume.
        **Job Description:**\n{job_description}\n\n**Resume to Rewrite:**\n{resume_text}
        """

        response = model.generate_content(prompt)
        parsed_json = clean_ai_response(response.text)
        
        if parsed_json:
            analyses_collection_ref = job_doc_ref.collection('analyses')
            analyses_collection_ref.add({
                'original_resume': resume_text,
                'rewritten_resume': parsed_json.get('rewritten_resume'),
                'analyzed_at': datetime.utcnow()
            })
            return jsonify(parsed_json), 200
        else:
            return jsonify({"error": "Failed to parse AI response."}), 500

    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"error": str(e)}), 500

# --- NEW: Cover Letter Generation Endpoint ---
@app.route("/generate-cover-letter", methods=['POST'])
def generate_cover_letter():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        job_id = data.get('jobId')
        resume_text = data.get('resumeText') # This should be the AI-tailored resume

        if not all([user_id, job_id, resume_text]):
            return jsonify({"error": "userId, jobId, and resumeText are required"}), 400

        job_doc_ref = db.collection('users', user_id, 'jobs').document(job_id)
        job_doc = job_doc_ref.get()
        if not job_doc.exists:
            return jsonify({"error": "Job not found"}), 404
        
        job_info = job_doc.to_dict()
        job_description = job_info.get('jobDescription')
        job_title = job_info.get('jobTitle')
        company_name = job_info.get('company')

        prompt = f"""
        Act as an expert career coach. Your task is to write a professional and compelling cover letter based on the provided tailored resume and job description.

        Instructions:
        1. The tone should be professional, confident, and enthusiastic.
        2. The letter should be structured with an introduction, a body, and a conclusion.
        3. The body should highlight 2-3 key experiences or skills from the resume that directly align with the most important requirements in the job description.
        4. The letter should be addressed to the "Hiring Manager" at the specified company.
        5. The final output MUST be a JSON object with a single key: "cover_letter". The value should be a single string containing the full text of the cover letter.

        **Company Name:** {company_name}
        **Job Title:** {job_title}
        **Job Description:**\n{job_description}\n\n**Tailored Resume:**\n{resume_text}
        """

        response = model.generate_content(prompt)
        parsed_json = clean_ai_response(response.text)

        if parsed_json:
            return jsonify(parsed_json), 200
        else:
            return jsonify({"error": "Failed to parse AI response."}), 500

    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
