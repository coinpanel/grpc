const fs = require('fs');
const packageJSON = require('./package.json');

const name = process.env.NPM_PACKAGE_NAME;
const newContent = {
  ...packageJSON,
  name: process.env.NPM_PACKAGE_NAME,
};

console.log('Updating package.json with name = ' + name);

fs.writeFileSync('./package.json', JSON.stringify(newContent, null, 2));
