import type { Chalk } from 'chalk';
import { z } from 'zod';

// Get valid colors and styles from chalk's type definitions
type ChalkColor = keyof Pick<
  Chalk,
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'grey'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright'
>;

type ChalkStyle = keyof Pick<Chalk, 'bold' | 'dim' | 'italic' | 'underline' | 'inverse'>;

const validColors = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
] as const satisfies readonly ChalkColor[];

const validStyles = [
  'bold',
  'dim',
  'italic',
  'underline',
  'inverse',
] as const satisfies readonly ChalkStyle[];

// Schema for environment variables that allows numbers but converts them to strings
const envSchema = z.record(z.string(), z.union([z.string(), z.number()])).transform((val) => {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(val)) {
    result[k] = String(v);
  }
  return result;
}) as z.ZodType<Record<string, string>>;

// Schema for a single command step
const commandStepSchema: z.ZodType<{
  command?: string;
  script?: string;
  steps?: (z.infer<typeof commandStepSchema> | string)[];
  concurrently?: {
    script: string;
    prefix?: string;
    label?: string;
  }[];
  env?: Record<string, string>;
  envFile?: string[];
  help?: string;
  depends?: string[];
  watch?: string[];
  subcommands?: Record<string, z.infer<typeof commandStepSchema>>;
}> = z.lazy(() =>
  z
    .object({
      command: z.string().optional(),
      script: z
        .string()
        .optional()
        .refine(
          (val) => !val || !val.includes('&&'),
          'Use steps array instead of && in script commands',
        ),
      steps: z.array(z.union([commandStepSchema, z.string()])).optional(),
      concurrently: z
        .array(
          z.object({
            script: z.string(),
            prefix: z
              .string()
              .optional()
              .refine(
                (val) => {
                  if (!val) return true;
                  const parts = val.split('.');
                  // Must have at least one part
                  if (parts.length === 0) return false;
                  // First part must be a valid color
                  if (!validColors.includes(parts[0] as ChalkColor)) return false;
                  // Any additional parts must be valid styles
                  return parts.slice(1).every((style) => validStyles.includes(style as ChalkStyle));
                },
                `prefix must be a valid chalk color optionally followed by styles (e.g., 'blue.bold' or 'red.dim.italic'). Valid colors: ${validColors.join(', ')}. Valid styles: ${validStyles.join(', ')}`,
              ),
            label: z.string().optional(),
          }),
        )
        .optional()
        .refine((val) => !val || val.length <= 10, 'Maximum 10 concurrent commands allowed'),
      env: envSchema.optional(),
      envFile: z
        .array(
          z
            .string()
            .refine((val) => val.startsWith('.env'), 'Environment files must start with .env'),
        )
        .optional(),
      help: z.string().min(1).max(100).optional(),
      depends: z
        .array(
          z
            .string()
            .refine(
              (val) => val.includes('/'),
              'Dependencies must be in format "command/subcommand"',
            ),
        )
        .optional(),
      watch: z.array(z.string()).optional(),
      subcommands: z.record(z.string(), commandStepSchema).optional(),
    })
    .refine(
      (data) => {
        // At least one of command, script, steps, or concurrently must be present
        return !!(data.command || data.script || data.steps || data.concurrently);
      },
      {
        message: 'At least one of command, script, steps, or concurrently must be present',
      },
    )
    .refine(
      (data) => {
        // Cannot have both command and script
        return !(data.command && data.script);
      },
      {
        message: 'Cannot have both command and script in the same step',
      },
    )
    .refine(
      (data) => {
        // If watch is present, command must be present
        return !data.watch || !!data.command;
      },
      {
        message: 'Watch can only be used with command',
      },
    ),
);

// Schema for the entire script file
export const scriptSchema = z.record(z.string(), commandStepSchema);

// Type definitions
export type CommandStep = z.infer<typeof commandStepSchema>;
export type ScriptConfig = z.infer<typeof scriptSchema>;

// Validation function with more context
export function validateScript(
  scriptPath: string,
  content: unknown,
): { valid: boolean; errors?: z.ZodError } {
  try {
    scriptSchema.parse(content);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}
