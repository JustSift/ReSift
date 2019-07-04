import LOADING from '../LOADING';
import { LegacyLoadingState } from '../models/LoadingState';

function getLoading(loadingState: number | LegacyLoadingState) {
  if (typeof loadingState === 'number') return (loadingState & LOADING) !== 0;
  return loadingState.isLoading();
}

export default function isLoading(...loadingStates: (number | LegacyLoadingState)[]) {
  return loadingStates.some(getLoading);
}
