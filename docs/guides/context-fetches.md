---
id: context-fetches
title: Context fetches
sidebar_label: Context fetches
---

A "context fetch" is simply a fetch that is accessed via the React context.

You can think of a context fetch as just a regular fetch that uses the built-in React context to get updates.

<details>
<summary>Long Technical Details</summary>

React context is ideal for ["low frequency unlikely updates (like locale/theme)"](https://github.com/facebook/react/issues/14110#issuecomment-448074060) because it uses "tree walking" to get updates (vs Redux's subscription mechanism). In essence, this means you can pull data from context as desired at near zero-cost with no worries of "tearing" (i.e. inconsistent state due to different parts of the tree getting updates at different times).

When we have app-wide fetches for app-wide data, it's ideal to use a context to grab the data from the fetch because these objects (e.g. an app configuration) may be used several times in one component (due to many custom hooks that use the config). If context is not used, then each use of the config would result in a Redux subscription.

Subscription mechanisms require components to subscribe on mount and then unsubscribe on un-mount. Since Resift uses Redux subscriptions internally, that means any component that use `useFetch` adds a subscription to Redux. This is usually the ideal path for most fetches however there are cases where too many Redux subscriptions causes problems. Specifically has occurred when we unknowingly created a list 500+ Redux subscriptions by having items of a list use `useFetch`.

Redux's subscriptions is implemented with a single-tiered/un-prioritized array of subscriptions. In the case of a list of react elements, each unsubscribe resulted in a `O(n)` operation for removing each subscription (due to [`Array.prototype.indexOf`](https://github.com/reduxjs/redux/blob/39cc043c55a770503bab3daf6026da5340923632/src/createStore.js#L153)) which overall resulted in an `O(n^2)` for un-mounting the whole list.

React context's updates are not implemented with a subscription mechanism. Again, React context uses a "zero-subscription" tree walking algorithm to allow for zero-cost reads but at the cost of slow updates (relatively, compared to subscriptions).

</details>

**TL;DR** Use context fetches when you want to use the result of a fetch globally.

When to use context fetches:

- when you have data from a fetch that you want to use app-wide (e.g. themes, configurations, locales)
- when this data doesn't change often (or at all)
- when you want to use data in many custom hooks

Good candidates for context fetches are:

- app configurations (user, global, entity, settings)
- authentication/current-logged-in-user
- themes
- locales

When not to use context fetches:

- when the data associated with the fetch is updated a lot
- when the data in the fetch is only used in a few components that is only rendered a few times on screen

## Usage

Example config fetch:

`configFetch.js`

```js
import { defineFetch } from 'resift';

const makeConfigFetch = defineFetch({
  displayName: 'Get Configuration',
  make: () => ({
    request: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/configuration',
      }),
  }),
});

const configFetch = makeConfigFetch();

export default configFetch;
```

Creating the config fetch:

`useConfig.js`

```js
import configFetch from './configFetch';
import { createContextFetch } from 'resift';

const [ConfigProvider, useConfig] = createContextFetch(configFetch);

export { ConfigProvider };
export default useConfig;
```

Adding the provider:

`App.js`

```js
import React, { useEffect } from 'react';
import { useDispatch } from 'resift';
import MyComponent from './MyComponent';
import configFetch from './configFetch';
import { ConfigProvider } from './useConfig';

function App() {
  const dispatch = useDispatch();

  // NOTE: you still have to start dispatch a fetch yourself
  // Context fetches just give you a new way to access the data from a fetch
  useEffect(() => {
    dispatch(configFetch());
  }, [dispatch]);

  return (
    // this assumes you have the ReduxProvider above this component somewhere
    <ConfigProvider>
      <MyComponent />
    </ConfigProvider>
  );
}
```

Using the config:

`MyComponent.js`

```js
import React from 'react';
import useConfig from './useConfig';

function MyComponent() {
  // just get the value
  const config = useConfig();

  // or get the status too
  const [alsoConfig, status] = useConfig({ withStatus: true });

  return <div>{config.displayName}</div>;
}
```

And don't forget, you can use this value in a custom hook:

```js
export default function useFilters() {
  const config = useConfig();
  const params = useQuery();

  // e.g.
  return params.filter(param => config.fields.includes(param));
}
```
