import React from 'react';
import defineFetch, { typedFetchFactory } from '../defineFetch';
import Guard from './Guard';

const _makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  make: movieId => ({
    request: () => () => ({
      id: 'movie123',
      name: 'test',
    }),
  }),
});

interface Movie {
  id: string;
  name: string;
}

const makeGetMovie = typedFetchFactory<Movie>()(_makeGetMovie);

function Example() {
  const getMovie = makeGetMovie('movie123');

  return <Guard fetch={getMovie}>{movie => <span>{movie.name}</span>}</Guard>;
}
