const fs = require('fs');
const content = fs.readFileSync('app/restaurant/[id].tsx', 'utf8');

try {
  require('@babel/parser').parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });
  console.log("No syntax errors found by Babel parser.");
} catch (err) {
  console.log("Syntax error details:", err.message);
  console.log(err.loc);
  console.log(content.split('\n').slice(err.loc.line - 5, err.loc.line + 5).join('\n'));
}
