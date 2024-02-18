export type ConnectionEvent<T> =
  | ConnectionAddedEvent<T>
  | ConnectionRemovedEvent;

interface ConnectionAddedEvent<T> {
  type: ConnectionEventType.Added;
  connectionId: string;
  connection: T;
}

interface ConnectionRemovedEvent {
  type: ConnectionEventType.Removed;
  connectionId: string;
}

export enum ConnectionEventType {
  Added,
  Removed,
}
