import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getFetch from '../getFetch';
import shallowEqual from '../shallowEqual';

// would've used a symbol but IE 11
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
    fetch.meta.actionCreatorId,
    fetch.meta.key,
  ]);

  return useSelector(state => memoizedGetFetch(fetch, state, options));
}
