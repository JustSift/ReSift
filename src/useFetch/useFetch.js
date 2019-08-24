import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import objectHash from 'object-hash';
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

export default function useFetch(fetch, options = {}) {
  const memoizedGetFetch = useMemo(() => memoize(getFetch), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOptions = useMemo(() => options, [objectHash(options)]);

  const selector = useCallback(state => memoizedGetFetch(fetch, state, memoizedOptions), [
    fetch,
    memoizedOptions,
    memoizedGetFetch,
  ]);

  return useSelector(selector);
}
