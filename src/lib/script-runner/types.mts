import { z } from 'zod';

export const EnvSchema = z.record(z.string());
export const StepsSchema = z.array(z.string());
export const ConcurrentlyItemSchema = z.object({
  command: z.string(),
  prefix: z.string().optional(),
  label: z.string().optional(),
});

export type Command = {
  command?: string;
  help?: string;
  steps?: string[];
  env?: Record<string, string>;
  envFile?: string;
  depends?: string[];
  concurrently?: { command: string; prefix?: string; label?: string }[];
  subcommands?: Record<string, Command>;
};

// Use z.lazy for recursive schemas
export const CommandSchema: z.ZodType<Command> = z.lazy(() =>
  z.object({
    command: z.string().optional(),
    help: z.string().optional(),
    steps: StepsSchema.optional(),
    env: EnvSchema.optional(),
    envFile: z.string().optional(),
    depends: z.array(z.string()).optional(),
    concurrently: z.array(ConcurrentlyItemSchema).optional(),
    subcommands: z.record(z.string(), CommandSchema).optional(),
  }),
);

export const ScriptSchema = z.record(z.string(), CommandSchema);

export type Scripts = Record<string, Command>;
