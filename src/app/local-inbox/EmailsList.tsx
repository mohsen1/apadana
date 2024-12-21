'use client';
import { LocalEmail } from '@prisma/client';
import { useState } from 'react';

interface EmailsListProps {
  emails: LocalEmail[];
}

export default function EmailsList({ emails }: EmailsListProps) {
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(emails[0] ?? null);

  return (
    <div className='flex flex-col '>
      <header className='border-border border-b'>
        <h1 className='p-4 text-2xl font-semibold'>Local Email Inbox</h1>
      </header>

      <div className='grid grid-cols-2 gap-4'>
        {/* Email List */}
        <div className='border-border col-span-1 overflow-auto border-r'>
          <ul>
            {emails.map((email) => (
              <li
                key={email.id}
                className={`border-border hover:bg-accent cursor-pointer border-b p-4 ${
                  selectedEmail?.id === email.id ? 'bg-accent border-l-primary border-l-4' : ''
                }`}
                onClick={() => setSelectedEmail(email)}
              >
                <h2 className='font-medium'>{email.subject}</h2>
                <p className='text-sm text-gray-600'>{email.to}</p>
                <p className='text-muted-foreground text-xs' suppressHydrationWarning>
                  {new Date(email.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Email Content */}
        <div className='col-span-2 flex flex-col overflow-auto'>
          {selectedEmail ? (
            <div className='flex flex-1 flex-col'>
              <div className='border-border border-b p-8'>
                <h2 className='mb-4 text-2xl font-bold'>{selectedEmail.subject}</h2>
                <p className='mb-2'>
                  <strong>From:</strong> {selectedEmail.from}
                </p>
                <p className='mb-2'>
                  <strong>To:</strong> {selectedEmail.to}
                </p>
              </div>

              <div className='flex-1 overflow-auto p-8'>
                <div
                  className='prose max-w-none'
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>

              <footer className='border-border mt-auto border-t p-4'>
                <p className='text-sm text-gray-600'>
                  Sent at: {new Date(selectedEmail.createdAt).toLocaleString()}
                </p>
              </footer>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>Select an email to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
