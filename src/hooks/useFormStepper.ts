import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'qs';
import { useCallback, useEffect, useMemo } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export type StepConfig<TFormData extends FieldValues> = {
  title: string;
  description: string;
  validation: z.ZodType<Partial<TFormData>> | z.AnyZodObject;
};

type UseFormStepperOptions<TFormData extends FieldValues> = {
  steps: StepConfig<TFormData>[];
  form: UseFormReturn<TFormData>;
  defaultValues: Partial<TFormData>;
  onStepChange?: (step: number) => void;
  paramPrefix?: string;
};

export function useFormStepper<TFormData extends FieldValues>({
  steps,
  form,
  defaultValues,
  onStepChange,
  paramPrefix = 'form',
}: UseFormStepperOptions<TFormData>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Merges schemas from steps[0..upToStep-1] if inclusive=false,
   * or steps[0..upToStep] if inclusive=true.
   */
  const getCombinedSchema = useCallback(
    (upToStep: number, inclusive: boolean) => {
      // If inclusive, we merge up to step `upToStep`.
      // If exclusive, we merge only up to `upToStep - 1`.
      const endIndex = inclusive ? upToStep + 1 : upToStep;
      return steps
        .slice(0, endIndex)
        .reduce((acc, step) => acc.merge(step.validation as z.AnyZodObject), z.object({}));
    },
    [steps],
  );

  /**
   * Returns current URL step param and form-data param,
   * defaulting step to 0 and formData to defaultValues if absent.
   */
  const getUrlParams = useCallback(() => {
    const step = searchParams.get(`${paramPrefix}-step`);
    const formData = searchParams.get(`${paramPrefix}-data`);
    return {
      step: step ? parseInt(step, 10) : 0,
      formData: formData ? qs.parse(formData) : defaultValues,
    };
  }, [searchParams, defaultValues, paramPrefix]);

  /**
   * Updates the URL with a new step and validated form data.
   * If `isNavigating` is true, we validate only up to the *current* step
   * (exclusive of the target). If false, we include the target step in the validation.
   */
  const updateUrlParams = useCallback(
    (targetStep: number, formData: Partial<TFormData>, isNavigating: boolean) => {
      // inclusive = !isNavigating
      // When navigating forward/backward, we exclude the target from validation.
      // When loading a specific step (goToStep or initial load), we include that step in validation.
      const schema = getCombinedSchema(targetStep, !isNavigating);
      const parsed = schema.safeParse(formData);

      if (!parsed.success) {
        console.error('Form data validation failed:', parsed.error);
        return false;
      }

      const serialized = qs.stringify(parsed.data);
      const params = new URLSearchParams(searchParams);
      params.set(`${paramPrefix}-step`, targetStep.toString());
      params.set(`${paramPrefix}-data`, serialized);

      // Don’t jump the user back to the top of the page
      router.push(`?${params.toString()}`, { scroll: false });
      return true;
    },
    [router, searchParams, getCombinedSchema, paramPrefix],
  );

  /**
   * On initial load (or if the user lands on a step from a shared link):
   * we parse and validate *up to and including* the current step (inclusive).
   */
  useEffect(() => {
    const { step, formData } = getUrlParams();
    const schema = getCombinedSchema(step, true); // inclusive
    const parsed = schema.safeParse(formData);

    if (parsed.success) {
      form.reset(parsed.data as TFormData);
      onStepChange?.(step);
    } else {
      form.reset(defaultValues as TFormData);
      // Force the user to start at step 0 if loaded data is invalid
      updateUrlParams(0, defaultValues as TFormData, false);
    }
  }, []);

  /**
   * Navigation helper object:
   * - nextStep/previousStep use exclusive validation (don’t include the new step).
   * - goToStep uses inclusive validation, effectively reloading that step directly.
   */
  const navigation = useMemo(() => {
    const { step: currentStep } = getUrlParams();

    return {
      currentStep,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === steps.length - 1,

      /**
       * Before letting user proceed, ensure the form data
       * up to (and including) the *current* step is valid.
       */
      canGoNext: () => {
        const schema = getCombinedSchema(currentStep, true);
        const values = form.getValues();
        return schema.safeParse(values).success;
      },

      /**
       * Jump directly to a step (e.g., user clicks a step indicator).
       * That’s effectively “loading” a step, so we use inclusive validation.
       */
      goToStep: (targetStep: number) => {
        if (targetStep >= 0 && targetStep < steps.length) {
          updateUrlParams(targetStep, form.getValues(), false);
        }
      },

      /**
       * Move forward one step:
       * Validate only up through the *current* step (exclusive of the new one).
       */
      nextStep: () => {
        if (currentStep < steps.length - 1) {
          const success = updateUrlParams(currentStep + 1, form.getValues(), true);
          if (success) onStepChange?.(currentStep + 1);
        }
      },

      /**
       * Move backward one step:
       * Also uses exclusive validation for the “destination” step.
       */
      previousStep: () => {
        if (currentStep > 0) {
          const success = updateUrlParams(currentStep - 1, form.getValues(), true);
          if (success) onStepChange?.(currentStep - 1);
        }
      },
    };
  }, [getUrlParams, steps.length, form, getCombinedSchema, updateUrlParams, onStepChange]);

  return {
    ...navigation,
    currentStepConfig: steps[navigation.currentStep],
  };
}
