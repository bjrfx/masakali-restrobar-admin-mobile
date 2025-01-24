import React, { useState, useEffect } from 'react';
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert'; // Import Joy UI Alert
import Link from '@mui/joy/Link';
import { auth, db } from '../../../config/firebase'; // Import Firestore and Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const customTheme = extendTheme({ defaultColorScheme: 'dark' });

export default function Signin({ onSignup }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // To display the alert with the user's name

  const handleLogin = async (event) => {
    event.preventDefault();
    const formElements = event.target.elements;
    const email = formElements.email.value;
    const password = formElements.password.value;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user's first name from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const firstName = userDoc.data().firstName;
        setSuccessMessage(`Welcome back, ${firstName}!`);
      } else {
        console.error('No such user document in Firestore!');
        setError('Failed to fetch user details.');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Form-maxWidth': '800px',
            '--Transition-duration': '0.4s',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.level1',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 400,
            maxWidth: '100%',
            p: 4,
            borderRadius: 'sm',
            boxShadow: 'md',
            backgroundColor: 'background.body',
          }}
        >
          <Typography level="h3" component="h1" textAlign="center">
            Sign In
          </Typography>
          <Typography level="body-sm" textAlign="center">
            Don't have an account?{' '}
            <Link onClick={onSignup} level="body-sm" underline="hover" sx={{ cursor: 'pointer' }}>
              Sign up
            </Link>
          </Typography>
          {successMessage && (
            <Alert variant="soft" color="success">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="soft" color="danger">
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" placeholder="Enter your email" />
              </FormControl>
              <FormControl required>
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" placeholder="Enter your password" />
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox size="sm" label="Remember me" name="persistent" />
                <Link level="body-sm" href="#" underline="hover">
                  Forgot your password?
                </Link>
              </Box>
              <Button type="submit" fullWidth loading={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}