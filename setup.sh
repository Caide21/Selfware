#!/bin/bash

echo "🔧 Installing backend Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "📦 Installing frontend Node.js packages..."
cd frontend-clean
npm install
cd ..

echo "✅ Setup complete. Codex environment is ready."

