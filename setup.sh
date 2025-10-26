#!/bin/bash

echo "🚀 Installation de Neo Chat App"

# Backend
echo "📦 Installation du backend..."
cd backend
pnpm install
cd ..

# Frontend
echo "🎨 Installation du frontend..."
cd frontend
pnpm install
cd ..

echo "✅ Installation terminée !"
echo "🎮 Pour démarrer :"
echo "   Backend: cd backend && pnpm start"
echo "   Frontend: cd frontend && pnpm run dev"
