const fs = require('fs');
const path = require('path');
const generateApiDoc = require('./generate-api-doc');

const defineFetchDoc = fs
  .readFileSync(path.resolve(__dirname, '../src/defineFetch/defineFetch.d.ts'))
  .toString();

it('works', () => {
  const apiDoc = generateApiDoc('defineFetch.js', defineFetchDoc);

  console.log(apiDoc);
  // expect(apiDoc).toMatchInlineSnapshot(`
  //   "defineFetch.js API

  //       this is a thing
  //   /

  //           \`\`\`ts

  //           \`\`\`
  //   the shape of the parameter object that goes into \`defineFetch\`
  //   /"
  // `);
});
