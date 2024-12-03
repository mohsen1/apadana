'use client';
import { LocalEmail } from '@prisma/client';
import { useState } from 'react';

interface EmailsListProps {
  emails: LocalEmail[];
}

export default function EmailsList({ emails }: EmailsListProps) {
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(
    emails[0] ?? null,
  );

  return (
    <div className='flex flex-col'>
      <header className='border-b'>
        <h1 className='text-2xl font-semibold p-4'>Local Email Inbox</h1>
      </header>

      <div className='flex-1 grid grid-cols-3 min-h-0'>
        {/* Email List */}
        <div className='col-span-1 border-r overflow-auto'>
          <ul>
            {emails.map((email) => (
              <li
                key={email.id}
                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  selectedEmail?.id === email.id
                    ? 'bg-primary-50 border-l-4 border-l-primary-500'
                    : ''
                }`}
                onClick={() => setSelectedEmail(email)}
              >
                <h2 className='font-medium'>{email.subject}</h2>
                <p className='text-sm text-gray-500'>{email.to}</p>
                <p className='text-xs text-gray-400' suppressHydrationWarning>
                  {new Date(email.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Email Content */}
        <div className='col-span-2 overflow-auto flex flex-col'>
          {selectedEmail ? (
            <div className='flex-1 flex flex-col'>
              <div className='border-b p-8'>
                <h2 className='font-bold text-2xl mb-4'>
                  {selectedEmail.subject}
                </h2>
                <p className='mb-2'>
                  <strong>From:</strong> {selectedEmail.from}
                </p>
                <p className='mb-2'>
                  <strong>To:</strong> {selectedEmail.to}
                </p>
              </div>

              <div className='flex-1 p-8 overflow-auto'>
                <div
                  className='prose max-w-none'
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              </div>

              <footer className='border-t p-4 mt-auto'>
                <p className='text-sm text-gray-500'>
                  Sent at: {new Date(selectedEmail.createdAt).toLocaleString()}
                </p>
              </footer>
            </div>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className='text-gray-500'>
                Select an email to view its content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
