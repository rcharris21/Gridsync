#!/bin/bash

# GridSync Deployment Script
echo "🚀 GridSync Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Files are ready in the 'dist' directory."
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload the 'dist' folder to Netlify"
    echo "2. Or connect your GitHub repository to Netlify for automatic deployment"
    echo "3. Or use the GitHub Actions workflow for automated deployment"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi 