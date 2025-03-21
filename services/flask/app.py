import os
from tempfile import NamedTemporaryFile

import torch
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS library
from werkzeug.utils import secure_filename

from clues import ScenarioAgent

app = Flask(__name__)

CORS(app)  # Enable CORS for all routes


WhisperAgent = None
DiscoverAgent = None

def load_discover_agent(data):
    global DiscoverAgent

    agent_title = data.get('agent_title')
    agent_description = data.get('agent_description')
    scenario_setting = data.get('scenario_setting')

    scenario = data.get('scenario')

    metrics_description = data.get('metrics_description')
    target_description = data.get('target_description')

    DiscoverAgent = ScenarioAgent(agent_title, agent_description, scenario_setting, scenario, metrics_description,
                                  target_description)

    return jsonify({'message': 'Discover Agent loaded successfully'}), 200


@app.route('/discover', methods=['GET'])
def discover():
    global DiscoverAgent, WhisperAgent

    if not DiscoverAgent:
        if WhisperAgent:
            del WhisperAgent
            torch.cuda.empty_cache()

        try:
            load_discover_agent(request.json)
        except Exception as e:
            return jsonify({'error': 'Discover Agent not loaded'}), 400

    data = request.json
    question = data.get('question')

    response, discoveries = DiscoverAgent.process_question(question)

    return jsonify({'response': response, 'discoveries': discoveries}), 200


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    global DiscoverAgent, WhisperAgent

    if not WhisperAgent:
        if DiscoverAgent:
            del DiscoverAgent
            torch.cuda.empty_cache()

        try:
            WhisperAgent = whisper.load_model("base")  # For memory reasons
        except Exception as e:
            return jsonify({'error': str(e)}), 500

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
        result = WhisperAgent.transcribe(temp_filepath)
        transcription = result.get("text", "")
        print("Transcription:", transcription)
    except Exception as e:
        os.remove(temp_filepath)
        return jsonify({'error': str(e)}), 500

    os.remove(temp_filepath)
    return jsonify({'transcription': transcription})


if __name__ == '__main__':
    app.run(debug=True)
