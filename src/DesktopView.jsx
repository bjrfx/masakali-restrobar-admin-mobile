import React from 'react';
import { Box, Typography, Container, Card, CardContent, Chip } from '@mui/joy';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DevicesIcon from '@mui/icons-material/Devices';
import logo from './logo.png';

const DesktopView = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Card
          variant="outlined"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            boxShadow: 'xl',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'white',
                boxShadow: 'lg',
                mb: 3,
                p: 2,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                  },
                },
              }}
            >
              <img 
                src={logo} 
                alt="Masakali Restrobar Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  borderRadius: '50%'
                }} 
              />
            </Box>

            {/* Badge */}
            <Chip
              color="primary"
              variant="soft"
              size="lg"
              startDecorator={<RestaurantIcon />}
              sx={{ mb: 3 }}
            >
              Masakali Restrobar Admin
            </Chip>

            {/* Main Heading */}
            <Typography
              level="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Mobile Only Experience
            </Typography>

            {/* Description */}
            <Typography
              level="body-lg"
              sx={{
                color: 'neutral.700',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              This admin panel is optimized for mobile devices to provide you with the best
              experience on the go. Please switch to a mobile device or resize your browser
              window to access the dashboard.
            </Typography>

            {/* Features */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 4,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'primary.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <PhoneIphoneIcon sx={{ fontSize: 28, color: 'primary.500' }} />
                </Box>
                <Typography level="title-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Mobile First
                </Typography>
                <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                  Designed for smartphones and tablets
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'success.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <RestaurantIcon sx={{ fontSize: 28, color: 'success.500' }} />
                </Box>
                <Typography level="title-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Manage Anywhere
                </Typography>
                <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                  Control your restaurant on the move
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'warning.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <DevicesIcon sx={{ fontSize: 28, color: 'warning.500' }} />
                </Box>
                <Typography level="title-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Real-time Updates
                </Typography>
                <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                  Stay connected with live data
                </Typography>
              </Box>
            </Box>

            {/* Instructions */}
            <Card
              variant="soft"
              color="primary"
              sx={{
                mt: 4,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <QrCode2Icon sx={{ fontSize: 32, color: 'primary.500' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography level="title-md" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Quick Access
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                      Scan QR code with your mobile device or visit on your phone
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Footer */}
            <Typography
              level="body-xs"
              sx={{
                color: 'neutral.500',
                mt: 4,
              }}
            >
              For the best experience, please use a screen width less than 768px
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DesktopView;