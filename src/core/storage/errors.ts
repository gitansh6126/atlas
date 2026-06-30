export class StorageError extends Error {
  readonly code: string;
  readonly cause: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message)
    this.name = 'StorageError'
    this.code = code
    this.cause = cause
  }
}

export class NotFoundError extends StorageError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id "${id}" not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends StorageError {
  constructor(entityType: string, id: string, message?: string) {
    super(message ?? `Conflict on ${entityType} "${id}"`, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class ValidationError extends StorageError {
  constructor(entityType: string, message: string) {
    super(`Validation failed for ${entityType}: ${message}`, 'VALIDATION')
    this.name = 'ValidationError'
  }
}

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError
}
