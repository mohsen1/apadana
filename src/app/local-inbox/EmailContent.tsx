import { LocalEmail } from '@prisma/client';
import { format } from 'date-fns';

import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailContentProps {
  email: LocalEmail;
}

export function EmailContent({ email }: EmailContentProps) {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='border-border border-b p-6'>
        <h2 className='mb-4 text-2xl font-bold'>{email.subject}</h2>
        <p className='text-muted-foreground mb-2'>
          <strong>From:</strong> {email.from}
        </p>
        <p className='text-muted-foreground mb-2'>
          <strong>To:</strong> {email.to}
        </p>
      </div>

      <ScrollArea className='flex-1 p-6'>
        <div
          className='prose dark:prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: email.html }}
        />
      </ScrollArea>

      <footer className='border-border mt-auto border-t p-4'>
        <p className='text-muted-foreground text-sm'>
          Sent at: {format(new Date(email.createdAt), 'PPp')}
        </p>
      </footer>
    </div>
  );
}
