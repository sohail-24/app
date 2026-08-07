const fs = require('fs');
const content = fs.readFileSync('db/schema.ts', 'utf8');
const lines = content.split('\n');
console.log(lines.find(l => l.includes('products = pgTable')));
