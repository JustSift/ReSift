const ts = require('typescript');
const { flatten } = require('lodash');
const { stripIndents } = require('common-tags');
const prettier = require('prettier');
const table = require('markdown-table');

function generateApiDoc(filename, contents) {
  function camelToDashed(camel) {
    return camel
      .split('')
      .map((letter, index) =>
        letter.toUpperCase() === letter && index !== 0 ? `-${letter}` : letter,
      )
      .join('')
      .toLowerCase();
  }

  function formatCode(code) {
    try {
      return prettier
        .format(code, {
          singleQuote: true,
          semi: false,
          parser: 'typescript',
        })
        .trim();
    } catch (e) {
      console.warn('Could not format a code block');

      return code.trim();
    }
  }

  function formatCodeForTypes(code) {
    return prettier
      .format(`declare const thing: ${code}`, {
        singleQuote: true,
        semi: false,
        parser: 'typescript',
      })
      .substring('declare const thing: '.length)
      .trim();
  }

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

    return flatten(children.map((child) => findApiBlocks(child, node)));
  }

  function getTextFromJsDocComment(comment) {
    return comment
      .split('\n')
      .filter((line) => !line.toLowerCase().includes('@docs'))
      .map((line) => {
        const startLineMatch = /^\s*\/\*\*(.*)/.exec(line);
        if (startLineMatch) return startLineMatch[1];

        const endLineMatch = /^\s*(.*)\*\//.exec(line);
        if (endLineMatch) return endLineMatch[1];

        const middleLineMatch = /^\s*\*(.*)/.exec(line);
        if (middleLineMatch) return middleLineMatch[1];

        return '';
      })
      .map((x) => x.trim())
      .join('\n')
      .trim()
      .replace(/@omitRequired/g, '')
      .replace(/@keepGenerics/g, '');
  }

  function getMarkdownFromJsDoc(node) {
    function getJsDocText(node) {
      if (node.kind === ts.SyntaxKind.JSDocComment) {
        const text = getText(node);
        if (text.includes('@docs')) {
          return text;
        }
      }

      const children = getChildren(node);
      for (const child of children) {
        const text = getJsDocText(child);
        if (text) return text;
      }

      return '';
    }

    const jsDocText = getJsDocText(node);
    if (!jsDocText) throw new Error('no jsdoc text found');
    const body = getTextFromJsDocComment(jsDocText);

    const titleMatch = /@docs(.*)/.exec(jsDocText);
    if (!titleMatch) throw new Error('no header match');
    const title = titleMatch[1].trim();

    return { title, body };
  }

  function getTableFromInterface(node) {
    function findProperties(node) {
      if (node.kind === ts.SyntaxKind.PropertySignature) return [node];
      if (node.kind === ts.SyntaxKind.MethodSignature) return [node];

      return flatten(getChildren(node).map((child) => findProperties(child)));
    }

    const propertyNodes = findProperties(node);

    function parseProperty(node) {
      function findFirstIdentifier(node) {
        if (node.kind === ts.SyntaxKind.Identifier) {
          return node;
        }

        const children = getChildren(node);

        for (const child of children) {
          const firstIdentifer = findFirstIdentifier(child);
          if (firstIdentifer) return firstIdentifer;
        }

        return null;
      }

      const firstIdentifierNode = findFirstIdentifier(node);
      if (!firstIdentifierNode) throw new Error('could not find identifier');

      const name = getText(firstIdentifierNode)
        .replace(/\n/g, '')
        .replace(/\/\*\*[\s\S]*\*\//g, '')
        .replace(/\s/g, '');

      function findDescription(node) {
        function getJsDocNode(node) {
          if (node.kind === ts.SyntaxKind.JSDocComment) return node;

          const children = getChildren(node);
          for (const child of children) {
            const node = getJsDocNode(child);
            if (node) return node;
          }

          return null;
        }

        const jsDocNode = getJsDocNode(node);
        if (!jsDocNode) return '';

        return getTextFromJsDocComment(getText(jsDocNode));
      }
      const description = findDescription(node);

      function findType(node) {
        function getColonPosition(node) {
          if (node.kind === ts.SyntaxKind.ColonToken) return node.pos;

          const children = getChildren(node);
          for (const child of children) {
            const pos = getColonPosition(child);
            if (pos) return pos;
          }

          return null;
        }

        const colonPosition = getColonPosition(node);
        if (!colonPosition) throw new Error('could not find type');

        return contents.substring(colonPosition + 1, node.end);
      }

      function formatType(typeStr) {
        return formatCodeForTypes(typeStr.replace(/<[^<>]*>/g, ''));
      }

      const type = formatType(findType(node).trim());

      const required = !getChildren(node).find(
        (child) => child.kind === ts.SyntaxKind.QuestionToken,
      );

      return { name, description, type, required };
    }

    function newLineToBr(str) {
      return str.replace(/\n/g, '<br>');
    }

    const omitRequired = getText(node).includes('@omitRequired');

    return table([
      ['Name', 'Description', 'Type', omitRequired ? null : 'Required'].filter((x) => x !== null),
      ...propertyNodes
        .map(parseProperty)
        .map(({ name, description, type, required }) =>
          [
            `<code>${newLineToBr(name)}</code>`,
            newLineToBr(description),
            `<code>${newLineToBr(type.replace(/\|/g, '&#124;'))}</code>`,
            omitRequired ? null : newLineToBr(required ? 'yes' : 'no'),
          ].filter((x) => x !== null),
        ),
    ]);
  }

  function getFormattedCode(node, keepGenerics) {
    let text = getText(node);

    // remove js doc comments
    text = text.replace(/\/\*\*[\s\S]*\*\//g, '');

    if (!keepGenerics) {
      // remove generics (bc they are confusing for non-ts users)
      text = text.replace(/<[^<>]*>/g, '');
    }

    text = text // remove export keyword
      .replace(/\s?export\s/g, '')
      // remove default keyword
      .replace(/\s?default\s/g, '');

    return formatCode(text);
  }

  const apiBlocks = flatten(getChildren(rootNode).map((child) => findApiBlocks(child, rootNode)));

  const markdownBlocks = apiBlocks.map((apiBlock) => {
    const { title, body } = getMarkdownFromJsDoc(apiBlock);

    if (apiBlock.kind === ts.SyntaxKind.InterfaceDeclaration) {
      return stripIndents`
        ## ${title}

        ${body}

        ${getTableFromInterface(apiBlock)}
      `;
    }

    return stripIndents`
      ## ${title}

      ${body}

      \`\`\`ts
      ${getFormattedCode(apiBlock, getText(apiBlock).includes('@keepGenerics'))}
      \`\`\`
    `;
  });

  return prettier.format(
    stripIndents`
    ---
    id: ${camelToDashed(filename)}
    title: ${filename} API
    sidebar_label: ${filename}
    ---

    > These docs are auto-generated from typings files (\`*.d.ts\`).

    ${markdownBlocks.join('\n\n')}
  `,
    {
      singleQuote: true,
      parser: 'markdown',
    },
  );
}

module.exports = generateApiDoc;
