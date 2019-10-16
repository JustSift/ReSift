import isNormal from '../isNormal';
import useData from '../useData';
import useStatus from '../useStatus';

function Guard({ fetch, children }) {
  const data = useData(fetch);
  const status = useStatus(fetch);

  if (!isNormal(status)) return null;
  if (data === null) return null;
  if (data === undefined) return null;
  return children(data);
}

export default Guard;
