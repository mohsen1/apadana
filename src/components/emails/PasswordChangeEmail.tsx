import { EmailLayout } from './EmailLayout';
import { Button } from './ui/Button';

interface PasswordChangeEmailProps {
  name: string;
}

export function PasswordChangeEmail({ name }: PasswordChangeEmailProps) {
  return (
    <EmailLayout>
      <h1>Password Changed Successfully</h1>
      <p>Hi {name},</p>
      <p>Your password was successfully changed just now.</p>
      <p>
        If you didn't make this change, please secure your account immediately by resetting your
        password and contacting our support team.
      </p>
      <Button href='https://apadana.app/auth/reset-password'>Reset Password</Button>
      <p>
        Need help? Contact us at <a href='mailto:support@apadana.app'>support@apadana.app</a>
      </p>
    </EmailLayout>
  );
}
