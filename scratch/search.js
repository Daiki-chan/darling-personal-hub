const fs = require('fs');
const lines = fs.readFileSync('d:\\webpromax\\components\\music\\music-app.module.css', 'utf-8').split('\n');
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('sectionheader') || line.toLowerCase().includes('section heading')) {
    console.log(`${i + 1}: ${line}`);
  }
});
