import LOADING from '../LOADING';

function getLoading(status) {
  return (status & LOADING) !== 0;
}

export default function isLoading(...statuses) {
  return statuses.some(getLoading);
}
