#!/bin/bash
echo "🧙‍♂️ Awakening Aether backend..."
cd "$(dirname "$0")"
source venv/bin/activate
python3 classifiers/emotionServer.py

