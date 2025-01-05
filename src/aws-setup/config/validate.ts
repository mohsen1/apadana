import { EnvConfig } from './types';

export function validateConfig(cfg: EnvConfig): void {
  if (!cfg.account || !cfg.region) {
    throw new Error('Account and region must be defined.');
  }
}
