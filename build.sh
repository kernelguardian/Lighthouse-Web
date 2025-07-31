#!/bin/bash

# Build script for Vercel deployment
echo "Building Lighthouse Christian Songs Database..."

# Install dependencies
npm install

# Build the client
echo "Building client..."
vite build

# Copy necessary files
echo "Preparing deployment files..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

echo "Build completed successfully!"