export default function createActionType(
  prefix: string,
  meta: { displayName: string; actionCreatorId: string },
) {
  return `${prefix} | ${meta.displayName} | ${meta.actionCreatorId}`;
}
