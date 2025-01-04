import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';

import { EmailLayout } from './EmailLayout';

interface PasswordChangeEmailProps {
  name: string;
}

export function PasswordChangeEmail({ name }: PasswordChangeEmailProps) {
  return (
    <EmailLayout preview='Password Changed Successfully'>
      <h1>Password Changed Successfully</h1>
      <p>Hi {name},</p>
      <p>Your password was successfully changed just now.</p>
      <p>
        If you didn't make this change, please secure your account immediately by resetting your
        password and contacting our support team.
      </p>
      <EmailCallToActionButton href='https://apadana.app/auth/reset-password'>
        Reset Password
      </EmailCallToActionButton>
      <p>
        Need help? Contact us at <a href='mailto:support@apadana.app'>support@apadana.app</a>
      </p>
    </EmailLayout>
  );
}
