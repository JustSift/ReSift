import React from 'react';
import defineFetch from '../defineFetch';
import useFetch from '../useFetch';
import Guard from './Guard';

const makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  make: movieId => ({
    request: () => () => ({
      id: 'movie123',
      name: 'test',
    }),
  }),
});

function Example() {
  const getMovie = makeGetMovie('movie123');
  const [movie] = useFetch(getMovie);

  return <Guard fetch={getMovie}>{movie => <span>{movie.name}</span>}</Guard>;
}
