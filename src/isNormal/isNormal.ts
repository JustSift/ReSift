import NORMAL from '../NORMAL';
import { LegacyLoadingState } from '../models/LoadingState';

function getNormal(loadingState: number | LegacyLoadingState) {
  if (typeof loadingState === 'number') return (loadingState & NORMAL) !== 0;
  return loadingState.isNormal();
}

export default function isNormal(...loadingStates: (number | LegacyLoadingState)[]) {
  return loadingStates.every(getNormal);
}
