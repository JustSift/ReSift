const ts = require('typescript');
const { flatten } = require('lodash');
const { stripIndents } = require('common-tags');

function generateApiDoc(filename, contents) {
  /**
   * @return {ts.Node[]}
   */
  function getChildren(node) {
    try {
      return node.getChildren();
    } catch {
      return [];
    }
  }

  const rootNode = ts.createSourceFile('example.ts', contents, ts.ScriptTarget.ES5, true);

  function getText(node) {
    try {
      return contents.substring(node.pos, node.end);
    } catch {
      return '';
    }
  }

  function findApiBlocks(node, parent) {
    if (node.kind === ts.SyntaxKind.JSDocComment) {
      const text = getText(node);
      if (text.includes('@docs')) {
        return [parent];
      }
    }

    const children = getChildren(node);

    return flatten(children.map(child => findApiBlocks(child, node)));
  }

  function getMarkdownFromJsDoc(node) {
    function getJsDocText(node) {
      if (node.kind === ts.SyntaxKind.JSDocComment) {
        const text = getText(node);
        if (text.includes('@docs')) {
          return text;
        }
      }

      return getChildren(node).find(child => getJsDocText(child));
    }

    const jsDocText = getText(getJsDocText(node));

    if (!jsDocText) {
      throw new Error('no jsdoc text found');
    }

    const body = jsDocText
      .split('\n')
      .filter(line => !line.toLowerCase().includes('@docs'))
      .map(line => {
        const startLineMatch = /^\s*\/\*\*(.*)/.exec(line);
        if (startLineMatch) return startLineMatch[1];

        const endLineMatch = /^\s*(.*)\*\//.exec(line);
        if (endLineMatch) return endLineMatch[1];

        const middleLineMatch = /^\s*\*(.*)/.exec(line);
        if (middleLineMatch) return middleLineMatch[1];

        return '';
      })
      .map(x => x.trim())
      .join('\n');

    const titleMatch = /@docs(.*)/.exec(jsDocText);
    if (!titleMatch) throw new Error('no header match');
    const title = titleMatch[1].trim();

    return { title, body };
  }

  function getTableFromInterface() {
    return '';
  }

  function getFormattedFunction() {
    return '';
  }

  function getFormattedCode() {
    return '';
  }

  const apiBlocks = flatten(getChildren(rootNode).map(child => findApiBlocks(child, rootNode)));

  const markdownBlocks = apiBlocks.map(apiBlock => {
    const { title, body } = getMarkdownFromJsDoc(apiBlock);

    if (apiBlock.kind === ts.SyntaxKind.InterfaceDeclaration) {
      return stripIndents`
        ## ${title}
        ${body}

        ${getTableFromInterface(apiBlock)}
      `;
    }

    if (apiBlock.kind === ts.SyntaxKind.FunctionDeclaration) {
      return stripIndents`
        ## ${title}
        ${body}

        \`\`\`ts
        ${getFormattedFunction(apiBlock)}
        \`\`\`
      `;
    }

    return stripIndents`
      ## ${title}
      ${body}

      \`\`\`ts
      ${getFormattedCode(apiBlock)}
      \`\`\`
    `;
  });

  return stripIndents`
    # ${filename} API

    ${markdownBlocks.join('\n\n')}
  `;
}

module.exports = generateApiDoc;
