/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'ReSift', // Title for your website.
  tagline: 'A React state management library for fetches',
  url: 'https://resift.org', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'resift',
  organizationName: 'Sift',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'introduction/what-is-resift', label: 'Docs' },
    { doc: 'api/about-api-docs', label: 'API' },
    { page: 'help', label: 'Help' },
    { href: 'https://github.com/JustSift/ReSift', label: 'GitHub' },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/favicon.ico',
  footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#7512FF',
    secondaryColor: '#2962FF',
  },

  /* Custom fonts for website */
  fonts: {
    myFont: ['Source Sans Pro', 'sans-serif'],
    myOtherFont: ['Source Sans Pro', 'sans-serif'],
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Sift`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  stylesheets: [
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,600,700,700i,900&display=swap',
    '/css/main.css',
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/resift-og-image.jpg',
  twitterImage: 'img/resift-og-image.jpg',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/JustSift/ReSift',

  docsSideNavCollapsible: true,

  gaTrackingId: 'UA-151301218-1',

  editUrl: 'https://github.com/JustSift/ReSift/edit/master/',
};

module.exports = siteConfig;
