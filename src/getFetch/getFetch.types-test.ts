// this file is only to test the typings
import getFetch from './getFetch';
import defineFetch from '../defineFetch';

// fake scope
() => {
  interface Person {
    foo: string;
  }

  const exampleObject = {
    fooBarBaz: 4,
  };

  const actionCreatorFactory = defineFetch({
    displayName: 'test',
    make: (personId: string) => ({
      key: [personId],
      fetch: (_: Person) => () => exampleObject,
    }),
  });

  const personId = 'test';
  const actionCreator = actionCreatorFactory(personId);
  const state = null as any;

  const [data, loadingState] = getFetch(actionCreator, state);

  if (data) {
    data.fooBarBaz;
  }
  loadingState as number;
};

() => {
  interface Person {
    foo: string;
  }

  const exampleObject = {
    fooBarBaz: 4,
  };

  const anotherExampleObject = {
    thisIsTheWrongOne: 'test',
  };

  const actionCreatorFactory = defineFetch({
    displayName: 'test',
    share: {
      namespace: 'test',
      merge: (previous, next) => exampleObject,
    },
    make: (personId: string) => ({
      key: [personId],
      fetch: (_: Person) => () => anotherExampleObject,
    }),
  });

  const personId = 'test';
  const actionCreator = actionCreatorFactory(personId);
  const state = null as any;

  const [data, loadingState] = getFetch(actionCreator, state);

  if (data) {
    data.fooBarBaz;
  }

  loadingState as number;
};
