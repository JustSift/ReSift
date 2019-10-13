import useFetch from '../useFetch';
import isNormal from '../isNormal';

function Guard({ fetch, children }) {
  const [data, status] = useFetch(fetch);

  return isNormal(status) && children(data);
}

export default Guard;
