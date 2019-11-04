const fs = require('fs');
const path = require('path');
const headJs = path.resolve(__dirname, './node_modules/docusaurus/lib/core/Head.js');
const contents = fs.readFileSync(headJs).toString();
fs.writeFileSync(
  headJs,
  contents.replace(
    /name="twitter:card" content="summary"/g,
    'name="twitter:card" content="summary_large_image"',
  ),
);
