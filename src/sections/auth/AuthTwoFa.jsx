import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setPendingChallenge } from 'store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { confirmTwoFa } from 'store/slices/authSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import AnimateButton from 'components/@extended/AnimateButton';

export default function AuthTwoFa() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  const pending = useSelector(state => state.auth.pendingChallenge);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If the URL contains challenge info (direct link), set it into store
    const c = searchParams.get('challengeId');
    const emailMasked = searchParams.get('emailMasked');
    const ttl = searchParams.get('twoFaTtlSeconds');
    if (c) {
      dispatch(setPendingChallenge({ challengeId: c, emailMasked, twoFaTtlSeconds: ttl ? parseInt(ttl, 10) : undefined }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pending) {
      // If no pending challenge, redirect back to login
      navigate('/login');
    }
  }, [pending, dispatch]);

  return (
    <Formik
      initialValues={{ code: '' }}
      validationSchema={Yup.object().shape({ code: Yup.string().required('Code is required') })}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        try {
          const action = await dispatch(confirmTwoFa({ challengeId: pending.challengeId, code: values.code }));
          if (confirmTwoFa.fulfilled.match(action)) {
            navigate('/');
          } else {
            const err = action.payload || action.error?.message || 'Invalid code';
            setErrors({ code: err });
          }
        } catch (err) {
          setErrors({ code: err?.message || 'Error' });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, values, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h3">Verificación de código</Typography>
                  <Typography variant="body2" color="text.secondary">Se envió un código a {pending.emailMasked}</Typography>
            </Grid>
            {error && (
              <Grid size={12}>
                <Typography color="error">{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</Typography>
              </Grid>
            )}
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="code">Código</InputLabel>
                <OutlinedInput
                  id="code"
                  type="text"
                  value={values.code}
                  name="code"
                  onBlur={handleBlur}
                  onChange={(e) => { handleChange(e); }}
                  fullWidth
                  error={Boolean(touched.code && errors.code)}
                />
                {touched.code && errors.code && (
                  <FormHelperText error>{errors.code}</FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid size={12}>
              <AnimateButton>
                <Button fullWidth size="large" variant="contained" color="primary" type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? 'Verificando...' : 'Verificar código'}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
