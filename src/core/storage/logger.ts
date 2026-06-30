export const LogLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface ILogger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'

const LOG_LEVEL = isDev ? LogLevel.Debug : LogLevel.Warn

function shouldLog(level: LogLevel): boolean {
  return level >= LOG_LEVEL
}

export const logger: ILogger = {
  debug(...args: unknown[]) {
    if (shouldLog(LogLevel.Debug)) {
      console.debug('[Atlas]', ...args)
    }
  },
  info(...args: unknown[]) {
    if (shouldLog(LogLevel.Info)) {
      console.info('[Atlas]', ...args)
    }
  },
  warn(...args: unknown[]) {
    if (shouldLog(LogLevel.Warn)) {
      console.warn('[Atlas]', ...args)
    }
  },
  error(...args: unknown[]) {
    if (shouldLog(LogLevel.Error)) {
      console.error('[Atlas]', ...args)
    }
  },
}
