import NORMAL from '../NORMAL';

function getNormal(status) {
  return (status & NORMAL) !== 0;
}

export default function isNormal(...statuses) {
  return statuses.every(getNormal);
}
