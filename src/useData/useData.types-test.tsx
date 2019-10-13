import defineFetch from '../defineFetch';
import useData from './useData';

const makeGetMovie = defineFetch({
  displayName: 'Get Movie',
  make: movieId => ({
    key: [movieId],
    request: () => () => ({ id: movieId, name: 'blah' }),
  }),
});

const getMovie = makeGetMovie('movie123');
const data = useData(getMovie);
