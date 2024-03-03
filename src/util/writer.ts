export interface Writer<T> {
  write(chunk: T): void;
}
