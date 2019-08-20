import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import getFetch from '../getFetch';
import shallowEqual from '../shallowEqual';
import UNKNOWN from '../UNKNOWN';

const neverCalculated = '__NEVER_CALCULATED__';
const emptyResult = [null, UNKNOWN];
const emptySelector = () => emptyResult;

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

  return useSelector(fetch ? selector : emptySelector);
}
