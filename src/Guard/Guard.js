import isNormal from '../isNormal';
import useData from '../useData';
import useStatus from '../useStatus';

function Guard({ fetch, children, shouldShowWhen = isNormal }) {
  const data = useData(fetch);
  const status = useStatus(fetch);

  return shouldShowWhen(status) && children(data);
}

export default Guard;
