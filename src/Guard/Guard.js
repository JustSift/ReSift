import isNormal from '../isNormal';
import useData from '../useData';
import useStatus from '../useStatus';

function Guard({ fetch, children }) {
  const data = useData(fetch);
  const status = useStatus(fetch);

  return isNormal(status) && children(data);
}

export default Guard;
