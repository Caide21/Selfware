import sys
import os

# Ensure /backend is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
from classifiers.emotion_classifier1 import ResonanceVectorEngine


app = Flask(__name__)
CORS(app)

engine = ResonanceVectorEngine()

@app.route("/classify", methods=["POST"])
def classify():
    try:
        data = request.get_json()
        user_input = data.get("text", "")
        fingerprint = data.get("fingerprint", "unknown")

        result = engine.analyze(user_input)

        return jsonify({
            "fingerprint": fingerprint,
            "input": user_input,
            **result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5005)
