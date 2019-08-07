# `defineFetch` HTTP services

Quick examples of CRUD GET, PUT, POST and DELETE `defineFetches.

## Example: GET with and without unique identifier

```ts
// component/actions/getPeople.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Get People',
  make: () => ({
    key: [],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/people`,
      }),
  }),
});
```

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

import React, { useEffect } from 'react';
import useFetch from '@sift/resift/useFetch';
import useDispatch from '@sift/resift/useDispatch';

// Returned Component
import PeopleList from './PeopleList';

// Action in example above
import makeGetPeople from './actions/getPeople';
import makeGetPerson from './actions/getPerson';

function Container() {
  const dispatch = useDispatch();

  const getPeople = makeGetPeople();
  const getPerson = makeGetPeople('John Smith');

  // On ComponentDidMount
  useEffect(() => {
    dispatch(getPeople());
    dispatch(getPerson());
  }, []);

  const [people, getPeopleStatus] = useFetch(getPeople());
  const [person, getPersonStatus] = useFetch(getPerson());

  return <PeopleList people={people} person={person} />;
}

export default Container;
```

<br />
<br />
<br />

## Example: Post

```ts
// component/actions/createPeople.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Create Person',
  make: () => ({
    key: [],
    request: (personName: string) => ({ http }) =>
      return http({
        method: 'POST',
        route: `/person`,
        data: {
          name: personName
        }
      }),
  }),
});
```

<br />
<br />
<br />

## Example: Delete

```ts
// component/actions/createPeople.ts

import defineFetch from '@sift/resift/defineFetch';

export default defineFetch({
  displayName: 'Delete Person',
  make: () => ({
    key: [],
    request: (personId: string) => ({ http }) =>
      return http({
        method: 'DELETE',
        route: `/person/personId`,
      }),
  }),
});
```

<br />
<br />
<br />

## Example: GET and PUT using shared keys

Note: the share key in define fetch glues these two fetches together.

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
      // Customize and add data
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

import React, { useEffect } from 'react';

// Required Resift tools
import useFetch from '@sift/resift/useFetch';
import useDispatch from '@sift/resift/useDispatch';

// Returned Component
import ProfileComponent from './Profile';

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

  const handleEditPerson = (newPerson: any) => {
    dispatch(editPerson(newPerson));
  };

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  // Note: Both on mount and `handleEditPerson` events will change this `person` data.
  const [person, status] = useFetch(getPerson());

  return <ProfileComponent profileData={person} onEditPerson={handleEditPerson} />;
}

export default Container;
```
