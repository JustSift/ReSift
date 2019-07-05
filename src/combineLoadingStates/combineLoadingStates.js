import isNormal from '../isNormal';
import isLoading from '../isLoading';
import isError from '../isError';
import isUnknown from '../isUnknown';
import UNKNOWN from '../UNKNOWN';
import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import ERROR from '../ERROR';

export default function combineLoadingStates(...loadingStates) {
  if (isUnknown(...loadingStates)) return UNKNOWN;

  const loading = isLoading(...loadingStates) ? LOADING : UNKNOWN;
  const normal = isNormal(...loadingStates) ? NORMAL : UNKNOWN;
  const error = isError(...loadingStates) ? ERROR : UNKNOWN;

  return loading | normal | error;
}
