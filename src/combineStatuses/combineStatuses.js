import isNormal from '../isNormal';
import isLoading from '../isLoading';
import isError from '../isError';
import isUnknown from '../isUnknown';
import UNKNOWN from '../UNKNOWN';
import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import ERROR from '../ERROR';

export default function combineStatuses(...statues) {
  if (isUnknown(...statues)) return UNKNOWN;

  const loading = isLoading(...statues) ? LOADING : UNKNOWN;
  const normal = isNormal(...statues) ? NORMAL : UNKNOWN;
  const error = isError(...statues) ? ERROR : UNKNOWN;

  return loading | normal | error;
}
