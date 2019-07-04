export default function createStore(displayName: string, actionCreatorId: string) {
  return `${displayName} | ${actionCreatorId}`;
}
