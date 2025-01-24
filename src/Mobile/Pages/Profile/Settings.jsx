import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

export default function Settings() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        mx: 'auto',
        px: { xs: 6, md: 6 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Typography level="h4" component="h2">
        Settings
      </Typography>
      <Typography level="body1" sx={{ mt: 5, ml: -5 }}>
        Manage your account settings here.
      </Typography>
    </Box>
  );
}