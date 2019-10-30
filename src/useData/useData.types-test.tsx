import defineFetch, { typedFetchFactory } from '../defineFetch';
import useData from './useData';

const _makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  make: (movieId: string) => ({
    key: [movieId],
    request: () => () => ({ id: movieId, name: 'blah' }),
  }),
});

interface Movie {
  id: string;
  name: string;
}

const makeGetMovie = typedFetchFactory<Movie>()(_makeGetMovie);

const getMovie = makeGetMovie('movie123');
const data = useData(getMovie);
