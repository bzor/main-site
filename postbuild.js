const fs = require('fs');
const path = require('path');

const cnameSource = path.resolve(__dirname, 'CNAME');
const cnameDest = path.resolve(__dirname, 'docs/docs', 'CNAME');

fs.copyFileSync(cnameSource, cnameDest);
console.log('CNAME file copied to docs directory');