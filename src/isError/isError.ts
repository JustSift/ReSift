import ERROR from '../ERROR';
import { LegacyLoadingState } from '../models/LoadingState';

function getError(loadingState: number | LegacyLoadingState) {
  if (typeof loadingState === 'number') return (loadingState & ERROR) !== 0;
  return loadingState.hasError();
}

export default function isError(...loadingStates: (number | LegacyLoadingState)[]) {
  return loadingStates.some(getError);
}
