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

## Creating the data service and HTTP service

`dataService.js`

```js
import { createHttpService, createDataService } from 'resift';

const http = createHttpService({
  prefix: '/api',
  getHeaders: () => {
    const token = localStorage.getItem('auth_token'); // or however you get your authentication token

    return {
      Authorization: `Bearer ${token}`,
    };
  },
});

const services = { http };

const dataService = createDataService({
  services,
  onError: e => {
    throw e;
  },
});

export default dataService;
```

## Adding the `<ResiftProvider />`

`App.js`

```js
import React from 'react';
import { ResiftProvider } from 'resift';
import RestOfYourApplication from '...';
import dataService from './dataService';

function App() {
  return (
    <ResiftProvider dataService={dataService}>
      <RestOfYourApplication />
    </ResiftProvider>
  );
}
```
