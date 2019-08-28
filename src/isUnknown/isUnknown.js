import UNKNOWN from '../UNKNOWN';

function getUnknown(status) {
  return status === UNKNOWN;
}

export default function isUnknown(...statuses) {
  return statuses.every(getUnknown);
}
