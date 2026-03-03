#!/bin/bash

# Health Care Assistant - Automated Setup Script
# This script automates the entire setup process

set -e  # Exit on error

echo "================================"
echo "🏥 Health Care Assistant Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Install global tools
echo "📦 Installing global Expo tools..."
npm install -g expo-cli eas-cli

echo ""
echo "📦 Installing project dependencies..."
npm install

echo ""
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and set your API_BASE_URL"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file (set API_BASE_URL)"
echo "2. Run: npm start"
echo "3. Press 'w' for web, 'a' for Android, 'i' for iOS"
echo ""
echo "Happy coding! 🚀"
