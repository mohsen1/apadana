import { LocalEmail } from '@prisma/client';
import { format } from 'date-fns';

import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailContentProps {
  email: LocalEmail;
}

export function EmailContent({ email }: EmailContentProps) {
  return (
    <div className='m-6 flex h-full flex-1 flex-col rounded-lg border-2 border-zinc-200'>
      <header className='border-border bg-zinc-200 p-4'>
        <h2 className='mb-4 text-2xl font-bold'>{email.subject}</h2>
        <p className='text-muted-foreground mb-2'>
          <strong>From:</strong> {email.from}
        </p>
        <p className='text-muted-foreground mb-2'>
          <strong>To:</strong> {email.to}
        </p>
      </header>

      {/* always white background. Our emails are not dark mode compatible */}
      <ScrollArea className='bg-background dark:bg-foreground flex-1 p-6'>
        <div
          className='prose dark:prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: email.html }}
        />
      </ScrollArea>

      <footer className='border-border mt-auto border-t bg-zinc-200 p-4'>
        <p className='text-muted-foreground text-sm' suppressHydrationWarning>
          Sent at: {format(new Date(email.createdAt), 'PPp')}
        </p>
      </footer>
    </div>
  );
}
