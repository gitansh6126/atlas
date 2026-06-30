import type { Command } from './base-command'
import type { Result } from '@/core/types/result'
import { logger } from '@/core/storage/logger'

interface CommandEntry {
  commandName: string;
  input: unknown;
  timestamp: number;
}

export class CommandBus {
  private history: CommandEntry[] = [];
  private historyPointer = -1;
  private readonly maxHistorySize: number;

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize
  }

  async execute<TInput, TOutput>(
    command: Command<TInput, TOutput>,
    input: TInput,
  ): Promise<Result<TOutput, Error>> {
    logger.info(`Executing command: ${command.name}`, input)

    const startTime = performance.now()
    const result = await command.execute(input)
    const duration = performance.now() - startTime

    if (result.success) {
      logger.debug(`Command ${command.name} succeeded in ${duration.toFixed(0)}ms`)

      if (command.canUndo()) {
        this.history = this.history.slice(0, this.historyPointer + 1)
        this.history.push({ commandName: command.name, input, timestamp: Date.now() })

        if (this.history.length > this.maxHistorySize) {
          this.history.shift()
        }
        this.historyPointer = this.history.length - 1
      }

      return result
    }

    logger.error(`Command ${command.name} failed:`, result.error)
    return result
  }

  async undo(): Promise<Result<void, Error>> {
    if (this.historyPointer < 0 || this.history.length === 0) {
      return { success: false, error: new Error('Nothing to undo') }
    }

    const entry = this.history[this.historyPointer]
    logger.info(`Undoing command: ${entry.commandName}`)
    this.historyPointer--
    return { success: true, data: undefined }
  }

  async redo(): Promise<Result<void, Error>> {
    if (this.historyPointer >= this.history.length - 1) {
      return { success: false, error: new Error('Nothing to redo') }
    }

    this.historyPointer++
    const entry = this.history[this.historyPointer]
    logger.info(`Redoing command: ${entry.commandName}`)
    return { success: true, data: undefined }
  }

  getHistory(): readonly CommandEntry[] {
    return this.history
  }

  clearHistory(): void {
    this.history = []
    this.historyPointer = -1
  }
}

export const commandBus = new CommandBus()
