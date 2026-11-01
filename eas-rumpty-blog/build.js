const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public');
const dest = path.join(__dirname, 'dist');

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Build successful: static assets copied to dist/');
