#!/bin/sh
set -e

echo 'Waiting for frontend...'
until node -e "const net = require('net'); const s = net.createConnection(3000, 'frontend'); s.on('connect', () => { s.end(); process.exit(0); }); s.on('error', () => process.exit(1));"; do
  echo 'Waiting for frontend...'
  sleep 2
done

echo 'Waiting for backend...'
until node -e "const net = require('net'); const s = net.createConnection(3001, 'backend'); s.on('connect', () => { s.end(); process.exit(0); }); s.on('error', () => process.exit(1));"; do
  echo 'Waiting for backend...'
  sleep 2
done

npx playwright test --project=chromium
