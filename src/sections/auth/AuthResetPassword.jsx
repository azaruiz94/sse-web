import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from 'store/slices/authSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// icons
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function AuthResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(state => state.auth.loading);
  const serverError = useSelector(state => state.auth.error);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(prev => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Formik
      initialValues={{ password: '', confirm: '' }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .required('Password is required')
          .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value?.trim())
          .min(8, 'Password must be at least 8 characters'),
        confirm: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
      })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        if (!token) {
          setErrors({ password: 'Token no proporcionado en la URL.' });
          setSubmitting(false);
          return;
        }
        try {
          const action = await dispatch(resetPassword({ token, password: values.password }));
          if (resetPassword.fulfilled.match(action)) {
            // If the backend returned a token, the slice persisted it; navigate to app
            const payload = action.payload || {};
            if (payload.token) {
              // auto-login
              navigate('/');
            } else {
              // no token returned, fallback to login page
              navigate('/login');
            }
          } else {
            const err = action.payload || action.error?.message || 'Error al restablecer contraseña';
            setErrors({ password: err });
          }
        } catch (err) {
          const msg = typeof err === 'string' ? err : err?.message || 'Error al restablecer contraseña';
          setErrors({ password: msg });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, values, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h3">Restablecer contraseña</Typography>
            </Grid>

            {serverError && (
              <Grid size={12}>
                <Typography color="error">{serverError}</Typography>
              </Grid>
            )}

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="password-reset">Nueva contraseña</InputLabel>
                <OutlinedInput
                  id="password-reset"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={(e) => { handleChange(e); }}
                  fullWidth
                  sx={{ width: '100%' }}
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                        size="small"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {touched.password && errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </Stack>
            </Grid>

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="confirm-reset">Confirmar contraseña</InputLabel>
                <OutlinedInput
                  id="confirm-reset"
                  type={showPassword ? 'text' : 'password'}
                  value={values.confirm}
                  name="confirm"
                  onBlur={handleBlur}
                  onChange={(e) => { handleChange(e); }}
                  fullWidth
                  sx={{ width: '100%' }}
                  error={Boolean(touched.confirm && errors.confirm)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                        size="small"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {touched.confirm && errors.confirm && (
                  <FormHelperText error>{errors.confirm}</FormHelperText>
                )}
              </Stack>
            </Grid>

            <Grid size={12}>
              <AnimateButton>
                <Button fullWidth size="large" variant="contained" color="primary" type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? 'Enviando...' : 'Restablecer contraseña'}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

AuthResetPassword.propTypes = {};
