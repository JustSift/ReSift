export default function createActionType(prefix, meta) {
  return `${prefix} | ${meta.displayName} | ${meta.actionCreatorId}`;
}
