from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS library
import whisper
import os
from werkzeug.utils import secure_filename
from tempfile import NamedTemporaryFile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the Whisper model once when the server starts.
model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(audio_file.filename)
    with NamedTemporaryFile(delete=False, suffix=".wav") as temp:
        audio_file.save(temp.name)
        temp_filepath = temp.name

    try:
        result = model.transcribe(temp_filepath)
        transcription = result.get("text", "")
        print("Transcription:", transcription)
    except Exception as e:
        os.remove(temp_filepath)
        return jsonify({'error': str(e)}), 500

    os.remove(temp_filepath)
    return jsonify({'transcription': transcription})

if __name__ == '__main__':
    app.run(debug=True)
