import ERROR from '../ERROR';

function getError(loadingState) {
  return (loadingState & ERROR) !== 0;
}

export default function isError(...loadingStates) {
  return loadingStates.some(getError);
}
