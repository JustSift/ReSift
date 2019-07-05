import UNKNOWN from '../UNKNOWN';

function getUnknown(loadingState) {
  return loadingState === UNKNOWN;
}

export default function isUnknown(...loadingStates) {
  return loadingStates.every(getUnknown);
}
