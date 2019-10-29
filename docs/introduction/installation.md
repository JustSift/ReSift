---
id: installation
title: Installation
sidebar_label: Installation
---

## Installation

```
npm i resift redux react-redux
```

> Redux 4 and React-Redux >= 7.1 are required peer dependencies to ReSift, [However, we plan on removing these dependencies.](https://github.com/JustSift/ReSift/issues/32#issuecomment-547537720)

> ⚠️ If you're already using Redux in your project, [follow this guide here](../guides/usage-with-redux.md).

## Creating the data service and HTTP service

Create a file called `dataService`. Create a data service instance and then export it.

`dataService.js`

```js
import { createHttpService, createDataService } from 'resift';

const http = createHttpService({
  // if all your endpoints share the same prefix, you can prefix them all here
  prefix: '/api',
  // if you need to add headers (for auth etc), you can do so using `getHeaders`
  getHeaders: () => {
    const token = localStorage.getItem('auth_token');

    return {
      Authorization: `Bearer ${token}`,
    };
  },
});

const dataService = createDataService({
  services: { http },
  onError: e => {
    // see https://resift.org/docs/main-concepts/error-handling for more info
    // on how to handle errors in resift.
    throw e;
  },
});

export default dataService;
```

## Adding the `<ResiftProvider />`

Lastly, wrap your application in the `ResiftProvider`. This will enable all the hooks APIs.

`App.js`

```js
import React from 'react';
import { ResiftProvider } from 'resift';
import RestOfYourApplication from '...';

// import the data service we just created
import dataService from './dataService';

function App() {
  return (
    <ResiftProvider dataService={dataService}>
      <RestOfYourApplication />
    </ResiftProvider>
  );
}
```
