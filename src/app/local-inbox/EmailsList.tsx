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
    <div className='grid grid-cols-3 h-screen'>
      <div className='col-span-1 border-r overflow-auto'>
        <h1 className='text-2xl font-semibold p-4 border-b'>
          Local Email Inbox
        </h1>

        <ul>
          {emails.map((email) => (
            <li
              key={email.id}
              className={`p-4 cursor-pointer border-b ${
                selectedEmail?.id === email.id ? 'bg-gray-100' : ''
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
      <div className='col-span-2 overflow-auto'>
        {selectedEmail ? (
          <div className='p-8'>
            <h2 className='font-bold text-2xl mb-4'>{selectedEmail.subject}</h2>
            <p className='mb-2'>
              <strong>To:</strong> {selectedEmail.to}
            </p>
            <div
              className='mt-4 prose max-w-none'
              dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
            />
            <p className='text-sm text-gray-500 mt-4'>
              Sent at: {new Date(selectedEmail.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-500'>Select an email to view its content</p>
          </div>
        )}
      </div>
    </div>
  );
}
