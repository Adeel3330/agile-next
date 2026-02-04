#!/bin/bash

# Clean build script to fix EAGAIN errors
# This script kills stuck Node processes and clears build cache

echo "Cleaning build environment..."

# Kill all Node.js processes (be careful with this in production)
echo "Killing Node.js processes..."
pkill -9 node 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules/.cache if it exists
rm -rf node_modules/.cache 2>/dev/null || true

# Clear npm cache (optional)
# npm cache clean --force

echo "Cleanup complete! You can now try building again with: npm run build:no-turbo"
