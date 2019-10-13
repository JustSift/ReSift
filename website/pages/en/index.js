/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

function Index({ config: siteConfig, language = '' }) {
  const { baseUrl, docsUrl } = siteConfig;

  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;
  const getDoc = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

  return (
    <div className="home">
      <div className="jumbotron">
        <div className="jumbotron__title">ReSift</div>
        <div className="jumbotron__subtitle">a state management library for data fetches</div>
        <code className="jumbotron__code">const person = useData(getPerson);</code>
        <div className="jumbotron__buttons">
          <a className="link-button" href={getDoc('introduction/what-is-resift')}>
            What is ReSift?
          </a>
          <a
            className="link-button link-button--primary"
            href={getDoc('introduction/quick-glance')}
          >
            Quick glance
          </a>
        </div>
      </div>
    </div>
  );
}

module.exports = Index;
