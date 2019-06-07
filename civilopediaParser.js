const linereader = require('line-reader');
const fs = require('fs');

let file = 'test.txt';
let text = '';

function iterate(line) {
  if (line[0] === '#') {
    fs.writeFileSync(file, text);
    file = 'public/civ3/' + line.substr(1).toLowerCase() + '.txt';
    text = '';
  }
  text += line + '\n';
}

linereader.eachLine('Civilopedia.txt', iterate);
