'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_RECIPIENTS = 'all';

interface EmailFilterProps {
  currentEmail?: string;
  uniqueEmails: string[];
}

export default function EmailFilter({ currentEmail, uniqueEmails }: EmailFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEmailChange = (email: string) => {
    const params = new URLSearchParams(searchParams);
    if (email && email !== ALL_RECIPIENTS) {
      params.set('to', email);
    } else {
      params.delete('to');
    }
    router.push(`/local-inbox?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground text-sm'>Show emails for:</span>
      <Select value={currentEmail ?? ALL_RECIPIENTS} onValueChange={handleEmailChange}>
        <SelectTrigger className='w-[250px]'>
          <SelectValue placeholder='All recipients' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_RECIPIENTS}>All recipients</SelectItem>
          {uniqueEmails.map((email) => (
            <SelectItem key={email} value={email}>
              {email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
