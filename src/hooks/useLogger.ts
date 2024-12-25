import { useCallback, useMemo } from 'react';

import type { LogLevel } from '@/utils/logger';
import { createLogger, Logger } from '@/utils/logger';

/**
 * React hook for using the logger within components
 * @param prefix - Optional prefix for log messages
 * @param level - Optional log level (defaults to 'debug')
 * @returns Logger instance with memoized methods
 */
export function useLogger(prefix?: string, level: LogLevel = 'debug') {
  const logger = useMemo(() => {
    if (prefix) {
      return new Logger(prefix, level);
    }
    // If no prefix provided, create logger with component file path
    return createLogger(new Error().stack?.split('\n')[2] ?? 'unknown', level);
  }, [prefix, level]);

  const debug = useCallback(logger.debug.bind(logger), [logger]);
  const info = useCallback(logger.info.bind(logger), [logger]);
  const warn = useCallback(logger.warn.bind(logger), [logger]);
  const error = useCallback(logger.error.bind(logger), [logger]);
  const log = useCallback(logger.log.bind(logger), [logger]);

  return {
    debug,
    info,
    warn,
    error,
    log,
    setLevel: logger.setLevel.bind(logger),
    enable: logger.enable.bind(logger),
    disable: logger.disable.bind(logger),
  };
}
