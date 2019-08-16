---
id: installation
title: Installation
sidebar_label: Installation
---

## Installation

```
npm i -s resift redux react-redux
```

> Redux 5 and React-Redux >= 7.1 are required peer dependencies to ReSift

## Adding the HTTP Service via `createHttpService`

`http.js`

```js
import { createHttpService } from 'resift';

const http = createHttpService({
  prefix: '/api',
  getHeaders: () => {
    const token = localStorage.getItem('auth_token'); // or however you get your authentication token

    return {
      Authorization: `Bearer ${token}`,
    };
  },
});

export default http;
```

## Adding the `<ResiftProvider />`

`App.js`

```js
import React from 'react';
import { ResiftProvider } from 'resift';
import RestOfYourApplication from '...';
import http from './http';

const services = { http };

function App() {
  const handleError = e => {
    // Make sure not to swallow any errors.
    // Use this `onError` callback to report errors that happen during data fetches
    console.error(e);
  };

  return (
    <ResiftProvider services={services} onError={handleError}>
      <RestOfYourApplication />
    </ResiftProvider>
  );
}
```
