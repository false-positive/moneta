from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/api/data', methods=['GET'])
def get_data():
    # Example data; you can modify this as needed
    data = {
        "name": "ChatGPT",
        "version": "3.5"
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
