import UNKNOWN from '../UNKNOWN';
import { LegacyLoadingState } from '../models/LoadingState';

function getUnknown(loadingState: number | LegacyLoadingState) {
  if (typeof loadingState === 'number') return loadingState === UNKNOWN;
  return loadingState.isUnknown();
}

export default function isUnknown(...loadingStates: (number | LegacyLoadingState)[]) {
  return loadingStates.every(getUnknown);
}
