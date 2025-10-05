import PropTypes from 'prop-types';
import React, { useState } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
// import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const twoFaEnabled = (import.meta.env.VITE_TWOFA_ENABLED === 'true');

  const handleSubmit = e => {
    e.preventDefault();
    // Await login to ensure user is set before navigating
    dispatch(loginUser(form)).then((res) => {
      if (res.type === 'auth/login/fulfilled') {
        const payload = res.payload || {};
        if (payload.twoFaRequired) {
          if (twoFaEnabled) {
            navigate('/twofa');
          } else {
            // Backend requires 2FA but frontend is configured to ignore it in dev.
            // Show a friendly message and log detail for developers.
            console.warn('Server requires 2FA but VITE_TWOFA_ENABLED is false. Enable it or use a backend without 2FA for local development.');
            alert('El servidor requiere verificación en dos pasos. Habilita VITE_TWOFA_ENABLED en tu .env de desarrollo para continuar.');
          }
        } else {
          navigate('/');
        }
      }
    });
  };

  return (
    <>
      {!twoFaEnabled && import.meta.env.MODE !== 'production' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          2FA está deshabilitado en esta build (VITE_TWOFA_ENABLED=false). Habilítalo para probar la verificación en dos pasos.
        </Alert>
      )}
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
            .max(10, 'Password must be less than 10 characters')
        })}
      >
        {({ errors, handleBlur, handleChange, touched, values }) =>  (
          <form noValidate>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setForm({ ...form, [e.target.name]: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit(e);
                    }}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setForm({ ...form, [e.target.name]: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit(e);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
{/*               <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me sign in</Typography>}
                  />
                  <Link variant="h6" component={RouterLink} to="#" color="text.primary">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid> */}
              <Grid size={12}>
                <AnimateButton>
                  <Button fullWidth size="large" variant="contained" color="primary" onClick={handleSubmit}>
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
