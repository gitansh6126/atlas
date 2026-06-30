export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E = Error> {
  success: false;
  error: E;
}

export type Result<T, E = Error> = Success<T> | Failure<E>;
