import AuthTwoFa from 'sections/auth/AuthTwoFa';
import AuthWrapper from 'sections/auth/AuthWrapper';
import Grid from '@mui/material/Grid';

export default function TwoFaPage() {
  return (
    <AuthWrapper>
        <Grid container spacing={3}>
            <Grid size={12}>
                <AuthTwoFa />
            </Grid>
        </Grid>
    </AuthWrapper>
  );
}
