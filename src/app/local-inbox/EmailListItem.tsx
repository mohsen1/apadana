import { LocalEmail } from '@prisma/client';
import { format } from 'date-fns';

interface EmailListItemProps {
  email: LocalEmail;
  isSelected: boolean;
  onClick: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <li
      className={`border-border hover:bg-accent/50 cursor-pointer border-b p-4 transition-colors ${
        isSelected ? 'bg-accent border-l-primary border-l-4' : ''
      }`}
      onClick={onClick}
    >
      <h2 className='line-clamp-1 font-medium'>{email.subject}</h2>
      <p className='text-muted-foreground line-clamp-1 text-sm'>{email.to}</p>
      <p className='text-muted-foreground text-xs' suppressHydrationWarning>
        {format(new Date(email.createdAt), 'PPp')}
      </p>
    </li>
  );
}
