import ERROR from '../ERROR';

function getError(status) {
  return (status & ERROR) !== 0;
}

export default function isError(...statuses) {
  return statuses.some(getError);
}
