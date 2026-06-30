import type { Result } from '@/core/types/result'
import type { StorageError } from '@/core/storage/errors'

export abstract class Command<TInput, TOutput> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category: string;

  abstract execute(input: TInput): Promise<Result<TOutput, Error | StorageError>>;

  canUndo(): boolean {
    return false
  }

  undo(_input: TInput): Promise<Result<void, Error>> {
    return Promise.resolve({ success: true, data: undefined })
  }
}
