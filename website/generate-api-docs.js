const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { flatten } = require('lodash');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const generateApiDoc = require('./generate-api-doc');

async function asyncFilter(array, predicate) {
  const result = await Promise.all(
    array.map(async value => ({
      value,
      keep: await predicate(value),
    })),
  );

  return result.filter(x => x.keep).map(x => x.value);
}

function camelToDashed(camel) {
  return camel
    .split('')
    .map((letter, index) =>
      letter.toUpperCase() === letter && index !== 0 ? `-${letter}` : letter,
    )
    .join('')
    .toLowerCase();
}

async function main() {
  /**
   * @param {string} dir
   * @return {string[]}
   */
  async function findAllTypingsFiles(dir) {
    const currentFiles = await readdir(dir);

    const fileNames = flatten(
      await Promise.all(
        currentFiles.map(async file => {
          const path = `${dir}/${file}`;
          const result = await stat(path);

          if (result.isDirectory()) {
            return findAllTypingsFiles(path);
          }

          return path;
        }),
      ),
    )
      .filter(file => file.endsWith('.d.ts'))
      .filter(file => !file.endsWith('index.d.ts'));

    return fileNames;
  }

  const fileNames = await findAllTypingsFiles(path.resolve(__dirname, '../src'));

  const docFileNames = await asyncFilter(fileNames, async fileName => {
    const contents = await readFile(fileName);
    const text = contents.toString();
    return text.includes('@docs');
  });

  console.log({ docFileNames });

  for (const docPath of docFileNames) {
    const pathSplit = docPath.split('/');
    const fileName = pathSplit[pathSplit.length - 1];
    const name = fileName.substring(0, fileName.length - '.d.ts'.length);
    const id = camelToDashed(name);

    const contents = (await readFile(docPath)).toString();

    const result = generateApiDoc(name, contents);

    try {
      await mkdir(path.resolve(__dirname, '../docs/api'));
    } catch {}
    await writeFile(path.resolve(__dirname, `../docs/api/${id}.md`), result);
  }

  const sidebars = JSON.parse(
    (await readFile(path.resolve(__dirname, './sidebars.json'))).toString(),
  );

  const docIds = docFileNames.map(docPath => {
    const pathSplit = docPath.split('/');
    const fileName = pathSplit[pathSplit.length - 1];
    const name = fileName.substring(0, fileName.length - '.d.ts'.length);
    const id = camelToDashed(name);

    return `api/${id}`;
  });

  const newSidebars = {
    ...sidebars,
    docs: {
      ...sidebars.docs,
      API: ['api/about-api-docs', ...docIds],
    },
  };

  await writeFile(path.resolve(__dirname, './sidebars.json'), JSON.stringify(newSidebars, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
