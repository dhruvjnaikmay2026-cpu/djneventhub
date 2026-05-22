#!/bin/sh
set -e

printf 'Waiting for MySQL at db:3306...\n'
until node -e "const net = require('net'); const s = net.createConnection(3306, 'db'); s.on('connect', ()=>{ s.end(); process.exit(0); }); s.on('error', ()=>process.exit(1));"; do
  printf '.'
  sleep 2
done
printf '\nMySQL is ready. Applying schema and seeding...\n'

npx prisma db push
npm run seed
npm start
