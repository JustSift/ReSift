---
id: what-are-data-services
title: What are data services?
sidebar_label: What are data services?
---

## What do data services do?

Data services allow you to write custom ways to get data and put it into ReSift's cache.

The `http` service is an example of a data service. You create this service by calling `createHttpService` from ReSift and then put the resulting service into the `services` property of the `createDataService` call.

```js
import { createHttpService, createDataService } from 'resift';

//     👇 this is a data service
const http = createHttpService();

const dataService = createDataService({
  //           👇 what you name this matters (see below)
  services: { http },
  onError: (e) => {
    throw e;
  },
});

export default dataService;
```

Because, the `http` service was added to the `services` object with the name `http`, it's available to use within fetch factories.

```js
import { defineFetch } from 'resift';

const makeGetPerson = defineFetch({
  displayName: 'Get Person',
  make: (personId) => ({
    //                 👇 we can "import" this with
    //                    this name because we passed
    //                    in `http` into the `services` above
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: `/people/${personId}`,
      }),
  }),
});
```

If we changed the name of the service to something else besides `http`, then that's the name we'd have to use when "importing" (well destructuring really) that service.

## Writing a data service

The following example defines a function `createGraphQlService` that will return a service that makes GraphQL requests.

In order to write a data service, you must define a curried function. The first set of parameters (`onCancel` and `getCanceled`) are injected by ReSift. These methods are for the cancellation mechanism. The second set of parameters are injected by the callers of your services.

It takes in a `rootEndpoint` for configuration and returns the curried function defining what the services does.

```js
import { CanceledError } from 'resift';

function createGraphQlService({ rootEndpoint }) {
  return ({ onCancel, getCanceled }) => async ({ query, operationName, variables }) => {
    if (getCanceled()) {
      throw new CanceledError();
    }

    onCancel(() => {
      // this function will be called when this request is canceled.
      // since we're using `window.fetch`, it can't be canceled so this does nothing for now
    });

    const response = await fetch(rootEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        operationName,
        variables: JSON.stringify(variables),
      }),
    });

    const json = await response.json();
    const { errors, data } = json;

    // add this manual check for errors and throw if there are any
    if (errors) {
      const error = new Error('GraphQL call returned with errors');
      error.errors = errors;
      throw error;
    }

    return data;
  };
}

export default createGraphQlService;
```

When writing a data service, you should always:

- return a function that takes in the cancellation mechanism parameters (`onCancel`, `getCanceled`)
- check to see if the request was cancelled before continuing flow
- throw the `CancelledError` if the request has been cancelled
- check to see if there is an error and `throw` if there is one
- return the results of the request. These results will be saved to ReSift's cache.

---

Check out this example of writing a custom GraphQL service. It uses a third-party QraphQLHub API to get data.

<iframe src="https://codesandbox.io/embed/amazing-pond-jepp5?fontsize=14"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Custom GraphQL Service"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
