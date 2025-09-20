import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthResetPassword from 'sections/auth/AuthResetPassword';

export default function ResetPasswordPage() {
  return (
    <AuthWrapper>
      <AuthResetPassword />
    </AuthWrapper>
  );
}
