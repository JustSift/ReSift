import NORMAL from '../NORMAL';

function getNormal(loadingState) {
  return (loadingState & NORMAL) !== 0;
}

export default function isNormal(...loadingStates) {
  return loadingStates.every(getNormal);
}
