/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    return `${baseUrl}${docsPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('introduction/what-is-resift', this.props.language)}>
              What is ReSift?
            </a>
            <a href={this.docUrl('introduction/quick-glance', this.props.language)}>Quick glance</a>
            <a href={this.docUrl('main-concepts/whats-a-fetch', this.props.language)}>
              What's a fetch?
            </a>
            <a href={this.docUrl('api/about-api-docs', this.props.language)}>API</a>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href="https://github.com/JustSift/ReSift/issues/new"
              target="_blank"
              rel="noreferrer noopener"
            >
              Open an issue
            </a>
            <a href="https://stackoverflow.com/" target="_blank" rel="noreferrer noopener">
              Stack Overflow
            </a>
            <a href="https://twitter.com/ricokahler" target="_blank" rel="noreferrer noopener">
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a
              className="github-button"
              href="https://github.com/JustSift/ReSift"
              data-icon="octicon-star"
              aria-label="Star JustSift/ReSift on GitHub"
            >
              Star
            </a>
            <a href="https://travis-ci.org/JustSift/ReSift">
              <img
                src="https://travis-ci.org/JustSift/ReSift.svg?branch=master"
                alt="Build Status"
              />
            </a>
            <a href="https://coveralls.io/github/JustSift/ReSift?branch=master">
              <img
                src="https://coveralls.io/repos/github/JustSift/ReSift/badge.svg?branch=master"
                alt="Coverage Status"
              />
            </a>
          </div>
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
        <section className="copyright">
          <a className="white-link" href="https://www.justsift.com">
            www.justsift.com
          </a>
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
