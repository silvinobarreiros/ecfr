export default function isOfType<T>(obj: any, ...properties: (keyof T)[]): obj is T {
  return properties.every((property) => (obj as T)[property] !== undefined)
}
