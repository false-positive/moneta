import os
import gc
from tempfile import NamedTemporaryFile

import torch
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS library
from werkzeug.utils import secure_filename

from clues import ScenarioAgent
from actions import ActionsAgent
from agent import Agent

app = Flask(__name__)

CORS(app)  # Enable CORS for all routes

InstructAgent = None
WhisperAgent = None
DiscoverAgent = None
HintAgent = None

def load_instruct_agent():
    global InstructAgent, WhisperAgent

    if not InstructAgent:
        if WhisperAgent and torch.cuda.is_available():
            del WhisperAgent
            gc.collect()

            torch.cuda.empty_cache()

        InstructAgent = Agent()

def load_whisper_agent():
    global WhisperAgent

    if not WhisperAgent:
        if InstructAgent and torch.cuda.is_available():
            del InstructAgent
            gc.collect()

            torch.cuda.empty_cache()

        WhisperAgent = whisper.load_model("base")

def load_hint_agent(data):
    global HintAgent, InstructAgent

    if HintAgent:
        return

    load_instruct_agent()

    actions = data.get('actions')

    if not actions:
        raise Exception("No actions from which to gather context for hints")

    HintAgent = ActionsAgent(InstructAgent, actions)

    return jsonify({'message': 'Hint Agent loaded successfully'}), 200




def load_discover_agent(data):
    global DiscoverAgent, InstructAgent

    if DiscoverAgent:
        return

    load_instruct_agent()

    agent_title = data.get('agent_title')
    agent_description = data.get('agent_description')
    scenario_setting = data.get('scenario_setting')

    scenario = data.get('scenario')

    metrics_description = data.get('metrics_description')
    target_description = data.get('target_description')

    if not agent_title or not agent_description or not scenario_setting or not scenario or not metrics_description or not target_description:
        raise Exception("Required context variables missed. Please add agent_title, agent_description, scenario_setting, scenario, metrics_description, target_description to request body")

    DiscoverAgent = ScenarioAgent(InstructAgent, agent_title, agent_description, scenario_setting, scenario, metrics_description,
                                  target_description)

    return jsonify({'message': 'Discover Agent loaded successfully'}), 200

@app.route('/hint', methods=['POST'])
def hint():
    global HintAgent

    data = request.json
    load_hint_agent(data)

    action_name = data.get('action_name')
    question = data.get('question')
    if not question:
        question = f"Explain {action_name} simply and how it could impact me"

    response = HintAgent.process_question(action_name, question)

    return jsonify({'response': response}), 200


@app.route('/discover', methods=['POST'])
def discover():
    global DiscoverAgent

    data = request.json
    load_discover_agent(data)

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
    app.run(host="0.0.0.0",debug=True)
