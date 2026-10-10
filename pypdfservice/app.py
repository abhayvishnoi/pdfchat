from flask import Flask, jsonify, request
from flask_cors import CORS
from mean.pdfchat.pypdfservice.processInput import process_input
from werkzeug.utils import secure_filename
import os
import time

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    try:
        if request.method == 'POST':
            print("Headers:", dict(request.headers))
            print("Files:", request.files)
            
            if 'file' not in request.files:
                return jsonify({"error": "No file part"}), 400
            
            file = request.files['file']
            print("Received file:", file.filename)
            
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
                
            if file and allowed_file(file.filename):
                # Ensure upload directory exists
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                filename=str(int(time.time())) + os.path.splitext(file.filename)[1]
                filename = secure_filename(filename)
                filepath = os.path.abspath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                file.save(filepath)
                
                print(f"File saved to: {filepath}")
                return jsonify({"name": filename,"url":filepath})
            else:
                return jsonify({"error": "File type not allowed"}), 400
    except Exception as e:
        print("Upload error:", str(e))
        return jsonify({"error": str(e)}), 401

@app.route('/prompt', methods=['POST', 'GET'])
def process_user_input():
    # try:
    data = request.get_json()
    prompt = data['text']
    file_paths = data['urls']
    chatId=data['chatId']
    print("Prompt:", data)
    data = process_input(prompt, file_paths,chatId)
    return jsonify(data)
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 401

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
