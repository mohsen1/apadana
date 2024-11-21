/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/**
 * Log a message to the console
 * @param message The message to log
 */
export default function logger(...messages: any[]) {
  if (!logger.isEnabled) {
    return;
  }
  console.log(...messages);
}

logger.isEnabled = true;

logger.enable = () => {
  logger.isEnabled = true;
};

logger.disable = () => {
  logger.isEnabled = false;
};

logger.debug = (...messages: any[]) => {
  if (!logger.isEnabled) {
    return;
  }
  console.debug(...messages);
};
logger.log = (...messages: any[]) => {
  if (!logger.isEnabled) {
    return;
  }
  console.log(...messages);
};
logger.info = (...messages: any[]) => {
  if (!logger.isEnabled) {
    return;
  }
  console.info(...messages);
};
logger.warn = (...messages: any[]) => {
  if (!logger.isEnabled) {
    return;
  }
  console.warn(...messages);
};
logger.error = (...messages: any[]) => {
  if (!logger.isEnabled) {
    return;
  }
  console.error(...messages);
};
