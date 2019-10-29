---
id: http-proxies
title: HTTP proxies
sidebar_label: HTTP proxies
---

HTTP Proxies are a feature of the HTTP [data service](../main-concepts/what-are-data-services.md).

HTTP proxies allow you to intercept `http` data service calls within fetches and potentially do something else.

You define an HTTP proxy by calling `createHttpProxy` from ReSift.

A common use case of HTTP proxies is to use them for mocking an HTTP server. We use HTTP proxies to power the demos in these docs.

`mockApi.js`

```js
import { createHttpProxy } from 'resift';

export const mockPeopleEndpoint = createHttpProxy(
  '/people/:personId',
  async ({ match, requestParams, http }) => {
    // ...
  },
);
```

After you create your proxy, add it to the `proxies` array when you create the HTTP service:

```js
import { createDataService, createHttpService } from 'resift';
import { mockPeopleEndpoint } from './mockApi';

const http = createHttpService({
  proxies: [mockPeopleEndpoint],
});

const dataService = createDataService({
  services: { http },
  onError: e => {
    throw e;
  },
});

export default dataService;
```

When you create an HTTP proxy, you provide a path or path options. The HTTP service will iterate through the proxies until it finds a match. The first match found will be the proxy it uses.

The matching algorithm is a blatant copy/paste of `react-router`'s [`matchPath`](https://reacttraining.com/react-router/web/api/matchPath)

## `createHttpProxy` API

The first argument to `createHttpProxy` is the path you'd like to match. If an `http` call matches this path, the second argument, the handler, will run.

In the handler, you can destructure: `requestParams`, `http`, `match`, and [more](../api/create-http-proxy.md#httpproxyparams)

- The `requestParams` are the parameters the caller (in the data service) passes to the `http` call
- `http` is the original `http` service. You can call it to make an actual HTTP request.
- `match` is the result of react-router's [`matchPath`](https://reacttraining.com/react-router/web/api/matchPath) function. It contains the match params in `match.params`

Here are some example mock endpoints from the [ReSift Notes example](../examples/resift-notes.md).

```js
import { createHttpProxy } from 'resift';
import shortId from 'shortid';
import delay from 'delay';
import moment from 'moment';
import { stripIndent } from 'common-tags';

const waitTime = 1000;

let noteData = [
  {
    id: 'sJxbrzBcn',
    content: stripIndent`
      # This is a note
    `,
    updatedAt: moment().toISOString(),
  },
];

export const notes = createHttpProxy({ path: '/notes', exact: true }, async ({ requestParams }) => {
  await delay(waitTime);

  const { method, data } = requestParams;

  if (method === 'GET') {
    // send a shallow copy just in case.
    // with a real API, the object returned would always be fresh references
    return [...noteData];
  }

  if (method === 'POST') {
    const newNote = {
      ...data,
      id: shortId(),
    };
    noteData.push(newNote);

    return newNote;
  }
});

export const note = createHttpProxy('/notes/:id', async ({ requestParams, match }) => {
  await delay(waitTime);

  const { method, data } = requestParams;
  const { id } = match.params;

  if (method === 'GET') {
    const note = noteData.find(note => note.id === id);
    if (!note) throw new Error('Not Found');

    return note;
  }

  if (method === 'PUT') {
    const index = noteData.findIndex(note => note.id === id);
    if (index === -1) throw new Error('Not Found');

    noteData[index] = data;
    return data;
  }

  if (method === 'DELETE') {
    const note = noteData.find(note => note.id === id);
    if (!note) throw new Error('Not Found');

    noteData = noteData.filter(note => note.id !== id);
    return undefined;
  }
});
```
