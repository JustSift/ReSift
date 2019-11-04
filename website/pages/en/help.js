/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

function Help() {
  const supportLinks = [
    {
      title: 'Found an issue? Have an idea?',
      content: `Don't hesitate to [open an issue](https://github.com/JustSift/ReSift/issues/new)`,
    },
    {
      title: 'Have a question?',
      content:
        'Ask it on [StackOverflow](https://stackoverflow.com/questions/tagged/resift). Use the tag `resift`',
    },
  ];

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>Need help?</h1>
          </header>
          <p>We're here for you!</p>
          <GridBlock contents={supportLinks} layout="threeColumn" />
        </div>
      </Container>
    </div>
  );
}
module.exports = Help;
