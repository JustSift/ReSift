# `defineFetch` API

'defineFetch' is where to start when an endpoint needs to be executed with its response data stored.

### `defineFetch Props`

---

| Prop          | Type              | Default    | Description                                                                                                                                                                                                                                                                                                  |
| ------------- | ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `displayName` | string            | required\* | `displayName` is used to describe what the action does.                                                                                                                                                                                                                                                      |
| `make`        | func (...keyArgs) | required\* | The make function creates a key to reference data and returns a function used for `useFetch` and `useDispatch` hooks. <br /><br /> The `keyArgs` arguments are optional strings that can be used when creating the data store key. A `keyArg` would be needed for fetching and storing data with unique ids. |
| `share`       | object            | -          | `share` object grants other `defineFetches` the ability to share the same key on the store. This will allow `defineFetch`'s to override onSuccess requests. This is ideal for CRUD endpoints that need to `get` and `edit` the same piece of data.                                                           |
| `conflict`    | string            | 'cancel'   |                                                                                                                                                                                                                                                                                                              |

&nbsp;

### `defineFetch.make(...) Return Props`

---

| Prop      | Type                                                                        | Default    | Description                                                                                                                                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | string[]                                                                    | required\* | These strings will be used to create a key for the data store.                                                                                                                                                                                                                                                                                |
| `request` | func (...requestArgs)<br /> Returns -> <br /> func (...resiftServices) <br> | required\* | The `request` function is what will dispatch. The return data is what will be stored and returned in `useFetch`. <br /><br /> `requestArgs` are optional arguments needed for a request. <br /><br /> `resiftServices` are services such as `http` and `dispatch` supplied through Resift that give additional functionality to your request. |

&nbsp;

Example:

```ts
// component/actions/getPerson.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Get Person',
  make: (personName: string) => ({
    key: [personName],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/person/${personId}`,
      }),
  }),
});
```

```tsx
// Example container using `definefetch` above
// - component/index.tsx

import React, { useEffect } from 'react';

// Required Resift tools
import useFetch from '@sift/resift/useFetch';
import useDispatch from '@sift/resift/useDispatch';

// Returned Component
import Profile from './Profile';

// Action in example above
import makeGetPerson from './actions/getPerson';

function Container() {
  const dispatch = useDispatch();

  // This builds the function used for dispatching requests and subscribing to changes.
  const getPerson = makeGetPerson('John Smith');

  // When component mounts the defineFetch's request function will fire.
  useEffect(() => {
    dispatch(getPerson());
  }, [dispatch, getPerson]);

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  const [person, status] = useFetch(getPerson());

  return <Profile profileData={person} />;
}

export default Container;
```
