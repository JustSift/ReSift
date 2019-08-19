import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getFetch from '../getFetch';
import shallowEqual from '../shallowEqual';

const neverCalculated = '__NEVER_CALCULATED__';

function memoize(fn) {
  let previous = neverCalculated;

  function returnPreviousIfUnchanged(...args) {
    const next = fn(...args);
    if (shallowEqual(next, previous)) return previous;
    previous = next;
    return next;
  }

  return returnPreviousIfUnchanged;
}

export default function useFetch(fetch, options) {
  const memoizedGetFetch = useMemo(() => memoize(getFetch), [
    fetch.meta.fetchFactoryId,
    fetch.meta.key,
  ]);

  const selector = useCallback(state => memoizedGetFetch(fetch, state, options), [
    fetch.meta.fetchFactoryId,
    fetch.meta.key,
  ]);

  return useSelector(selector);
}
