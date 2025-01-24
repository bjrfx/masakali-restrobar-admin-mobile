import React, { useState, useEffect } from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import { auth, db } from '../../../config/firebase'; // Adjust the path based on your file structure
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import Link from '@mui/joy/Link';
const customTheme = extendTheme({ defaultColorScheme: 'dark' });

export default function Signup({onSignin}) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    const formElements = event.target.elements;
    const firstName = formElements.firstName.value;
    const lastName = formElements.lastName.value;
    const role = formElements.role.value;
    const email = formElements.email.value;
    const password = formElements.password.value;

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        role,
        email,
      });

      setSuccess('User registered successfully!');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
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
          width: { xs: '100%', md: '50vw' },
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            px: 2,
          }}
        >
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
            }}
          >
            <Typography component="h1" level="h3">
              Sign up
            </Typography>
            <form onSubmit={handleSignup}>
              <FormControl required>
                <FormLabel>First Name</FormLabel>
                <Input type="text" name="firstName" />
              </FormControl>
              <FormControl required>
                <FormLabel>Last Name</FormLabel>
                <Input type="text" name="lastName" />
              </FormControl>
              <FormControl required>
                <FormLabel>Role</FormLabel>
                <select
                  name="role"
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid lightgray',
                  }}
                >
                  <option value="" disabled selected>
                    Select your role
                  </option>
                  <option value="Guest">Guest</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </FormControl>
              <FormControl required>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" />
              </FormControl>
              <FormControl required>
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" />
              </FormControl>
              <Button type="submit" fullWidth>
                Sign up
              </Button>
            </form>
            {error && <Typography color="danger">{error}</Typography>}
            {success && <Typography color="success">{success}</Typography>}
            <Typography>
      Already have an account? <Link onClick={onSignin}>Sign in</Link>
    </Typography>
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}