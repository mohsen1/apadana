'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useToast } from '@/hooks/useToast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { earlyAccessSignup } from '@/app/action';

// Define the form schema using the same schema as the action
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export function EarlyAccessForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await earlyAccessSignup(data);

    if (result && !('error' in result)) {
      toast({
        title: "You're on the list!",
        description: "Thanks for signing up. We'll be in touch soon!",
      });
      reset();
    } else {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        return handleSubmit(onSubmit)(e);
      }}
      className='flex w-full max-w-sm items-center space-x-2'
    >
      <Input
        type='email'
        placeholder='Enter your email'
        {...register('email')}
        className='flex-1'
      />
      <Button type='submit' disabled={isSubmitting}>
        {isSubmitting ? (
          'Signing up...'
        ) : (
          <>
            <Mail className='mr-2 h-4 w-4' />
            Get Early Access
          </>
        )}
      </Button>
    </form>
  );
}
