---
id: crud-example
title: CRUD Examples
sidebar_label: CRUD Examples
---

# `defineFetch` HTTP services

Quick examples of GET, PUT, POST and DELETE `defineFetches`.

## Example: GET with and without unique identifier

```ts
// component/actions/peopleFetch.ts

import defineFetch from 'resift/defineFetch';

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
// component/actions/personFetch.ts

import defineFetch from 'resift/defineFetch';

export default defineFetch({
  displayName: 'Get Person',
  make: (personId: string) => ({
    key: [personId],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/person/${personId}`,
      }),
  }),
});
```

```tsx
// Example PeopleFetcher component using `definefetch` above

import React, { useEffect } from 'react';
import useFetch from 'resift/useFetch';
import useDispatch from 'resift/useDispatch';

// Returned Component
import PeopleList from './PeopleList';

// Action in example above
import makePeopleFetch from './actions/peopleFetch';
import makePersonFetch from './actions/personFetch';

function PeopleFetcher() {
  const dispatch = useDispatch();

  const peopleFetch = makePeopleFetch();
  const personFetch = makePersonFetch('John Smith');

  // On ComponentDidMount
  useEffect(() => {
    dispatch(peopleFetch());
    dispatch(makePersonFetch());
  }, [dispatch, makePersonFetch, peopleFetch]);

  const [people, peopleStatus] = useFetch(peopleFetch());
  const [person, personStatus] = useFetch(makePersonFetch());

  return <PeopleList people={people} person={person} />;
}

export default PeopleFetcher;
```

<br />
<br />
<br />

## Example: Post

```ts
// component/actions/createPerson.ts

import defineFetch from 'resift/defineFetch';

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
// component/actions/deletePerson.ts

import defineFetch from 'resift/defineFetch';

export default defineFetch({
  displayName: 'Delete Person',
  make: () => ({
    key: [],
    request: (personId: string) => ({ http }) =>
      return http({
        method: 'DELETE',
        route: `/person/${personId}`,
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
// component/actions/personFetch.ts

import defineFetch from 'resift/defineFetch';

export default defineFetch({
  displayName: 'Get Person',
  share: {
    namespace: 'person',
  },
  make: (personId: string) => ({
    key: [personId],
    request: () => ({ http }) =>
      return http({
        method: 'GET',
        route: `/person/${personId}`,
      }),
  }),
});
```

```ts
// component/actions/makeUpdatePersonFetch.ts

import defineFetch from 'resift/defineFetch';

export default defineFetch({
  displayName: 'Update Person',
  share: {
    namespace: 'person',
    merge: (previous, next) => {
      // Customize and add data
      return { ...previous, ...next }
    },
  },
  make: (personId: string) => ({
    key: [personId],
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
// Example component fetcher using `definefetch` above
// - component/index.tsx

import React, { useEffect } from 'react';

// Required Resift tools
import useFetch from 'resift/useFetch';
import useDispatch from 'resift/useDispatch';

// Returned Component
import ProfileComponent from './Profile';

// Action in example above
import makePersonFetch from './actions/personFetch';
import makeUpdatePersonFetch from './actions/makeUpdatePersonFetch';

function ProfileFetcher() {
  const dispatch = useDispatch();

  // This builds the function used for dispatching requests and subscribing to changes.
  const personFetch = makePersonFetch('John Smith');
  const updatePersonFetch = makeUpdatePersonFetch('John Smith');

  // When component mounts the defineFetch's request function will fire.
  useEffect(() => {
    dispatch(personFetch());
  }, [dispatch, personFetch]);

  const handleEditPerson = (newPerson: any) => {
    dispatch(updatePersonFetch(newPerson));
  };

  // `useFetch` subscribes to changes made during the request phase of the dispatch above
  // Note: Both on mount and `handleEditPerson` events will change this `person` data.
  const [person, status] = useFetch(personFetch());

  return <Profile profileData={person} onEditPerson={handleEditPerson} />;
}

export default ProfileFetcher;
```
