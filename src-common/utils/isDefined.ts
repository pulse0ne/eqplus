export default function isDefined<T>(value: T|null|undefined): boolean {
  return value !== null && value !== undefined;
}
