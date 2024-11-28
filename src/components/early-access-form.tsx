'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EarlyAccessForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast({
        title: "You're on the list!",
        description: "Thanks for signing up. We'll be in touch soon!",
      });

      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex w-full max-w-sm items-center space-x-2'
    >
      <Input
        type='email'
        placeholder='Enter your email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className='flex-1'
      />
      <Button type='submit' disabled={loading}>
        {loading ? (
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
