import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import getFetch from '../getFetch';
import shallowEqual from '../shallowEqual';
import UNKNOWN from '../UNKNOWN';
import _get from 'lodash/get';

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
  const fetchFactoryId = _get(fetch, ['meta', 'fetchFactoryId'], 'EMPTY_FETCH');
  const key = _get(fetch, ['meta', 'key'], 'EMPTY_KEY');

  const memoizedGetFetch = useMemo(() => memoize(getFetch), [fetchFactoryId, key]);

  const selector = useCallback(state => memoizedGetFetch(fetch, state, options), [
    fetchFactoryId,
    key,
  ]);

  return useSelector(fetch ? selector : emptySelector);
}
