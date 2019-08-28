export default function createStoreKey(displayName, fetchFactoryId) {
  return `${displayName} | ${fetchFactoryId}`;
}
