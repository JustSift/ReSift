const fs = require('fs');
const path = require('path');
const generateApiDoc = require('./generate-api-doc');

const exampleDoc = `
// this should turn everything that has the @docs directive into markdown

/**
 * @docs This is a title
 * 
 * This is a description. The output should have no generics.
 */
function test<T>(t: T): number

/**
 * @docs Test Interface
 * 
 * This interface should turn into a table
 */
interface Test {
  /**
   * this is a description of foo
   */
  foo: string;
  bar?: number;
  complex: {
    a: Date;
    b: Animal;
  };
}

/**
 * @docs \`Animal\`
 * makes a sound
 */
interface Animal {
  makeSound(): string;
}

/**
 * this won't be included because it doesn't have the directive
 */
function boo(): number;

/**
 * @docs Other code test
 * this will have its generics removed
 */
type OtherCode<Cool, Generic, Thing> = Cool & Generic & Thing;
`;

it('works', () => {
  const apiDoc = generateApiDoc('exampleDoc', exampleDoc);

  expect(apiDoc).toMatchInlineSnapshot(`
    "---
    id: example-doc
    title: exampleDoc API
    sidebar_label: exampleDoc
    ---

    > These docs are auto-generated from typings files (\`*.d.ts\`).

    ## This is a title

    This is a description. The output should have no generics.

    \`\`\`ts
    // this should turn everything that has the @docs directive into markdown

    function test(t: T): number;
    \`\`\`

    ## Test Interface

    This interface should turn into a table

    | Name                 | Description                  | Type                                          | Required |
    | -------------------- | ---------------------------- | --------------------------------------------- | -------- |
    | <code>foo</code>     | this is a description of foo | <code>string</code>                           | yes      |
    | <code>bar</code>     |                              | <code>number</code>                           | no       |
    | <code>complex</code> |                              | <code>{<br> a: Date<br> b: Animal<br>}</code> | yes      |

    ## \`Animal\`

    makes a sound

    | Name                   | Description | Type                | Required |
    | ---------------------- | ----------- | ------------------- | -------- |
    | <code>makeSound</code> |             | <code>string</code> | yes      |

    ## Other code test

    this will have its generics removed

    \`\`\`ts
    type OtherCode = Cool & Generic & Thing;
    \`\`\`
    "
  `);
});
