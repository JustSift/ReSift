# `defineFetch.share` API

The `share` property on 'defineFetch' allows other `defineFetch` actions to store data on the same key.

A common use case for `share` are CRUD endpoints that need to update the same data store key through `get` and `put` http requests.

### `share Props`

---

| Prop        | Type             | Default    | Description                                                                                                        |
| ----------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `namespace` | string           | required\* | Another `defineFetch` function sharing the same name space will result them sharing the same key to the data store |
| `merge`     | func(prev, next) | required\* | `merge` adds customizing functionality before the data is applied to the data store.                               |

&nbsp;

Example:

```ts
// component/actions/getPerson.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Get Person',
  share: {
    namespace: 'person',
    // Keep data flow as is
    merge: (previous, next) => ({ ...previous, ...next }),
  },
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

```ts
// component/actions/editPerson.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Edit Person',
  share: {
    namespace: 'person',
    merge: (previous, next) => {
      // Customize and add data if needed
      return { ...previous, ...next, lastEdited: new Date() }
    },
  },
  make: (personName: string) => ({
    key: [personName],
    request: (personData: any) => ({ http }) =>
      return http({
        method: 'PUT',
        route: `/person/${personId}`,
        data: personData
      }),
  }),
});
```

```tsx
// Example container using `definefetch` above
// - component/index.tsx

import React, { useEffect, useCallback } from 'react';

// Required Resift tools
import useFetch from '@sift/resift/useFetch';
import useDispatch from '@sift/resift/useDispatch';

// Returned Component
import Profile from './Profile';

// Action in example above
import makeGetPerson from './actions/getPerson';
import makeEditPerson from './actions/editPerson';

function Container() {
  const dispatch = useDispatch();

  // This builds the function used for dispatching requests and subscribing to changes.
  const getPerson = makeGetPerson('John Smith');
  const editPerson = makeEditPerson('John Smith');

  // When component mounts the defineFetch's request function will fire.
  useEffect(() => {
    dispatch(getPerson());
  }, []);

  const handleEditPerson = useCallback(
    (newPerson: any) => {
      dispatch(editPerson(newPerson));
    },
    [editPerson]
  );

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  // Note: Both on mount and `handleEditPerson` events will change this `person` data.
  const [person, status] = useFetch(getPerson());

  return <Profile profileData={person} onEditPerson={handleEditPerson} />;
}

export default Container;
```
