import { useMemo } from 'react';
import useData from '../useData';
import useStatus from '../useStatus';

function useFetch(fetch, options) {
  const data = useData(fetch);
  const status = useStatus(fetch, options);

  return useMemo(() => [data, status], [data, status]);
}

export default useFetch;
