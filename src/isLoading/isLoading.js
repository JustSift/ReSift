import LOADING from '../LOADING';

function getLoading(loadingState) {
  return (loadingState & LOADING) !== 0;
}

export default function isLoading(...loadingStates) {
  return loadingStates.some(getLoading);
}
