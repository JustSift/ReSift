export default function createShareKey(namespace: string, key: string) {
  return `${namespace} | ${key}`;
}
