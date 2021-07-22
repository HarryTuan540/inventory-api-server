#! /bin/bash
cd /app
npm install --production --silent
npm audit fix
npm install --save-dev nodemon
npm start 
