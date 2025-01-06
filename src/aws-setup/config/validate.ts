import { EnvConfig } from './types';

export function validateConfig(cfg: EnvConfig): void {
  if (!cfg.region) {
    throw new Error('Region must be defined.');
  }
}
