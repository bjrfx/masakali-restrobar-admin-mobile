import React from 'react';
import { useAuth } from '../../../config/AuthProvider'; // Adjust path as needed
import { auth } from '../../../config/firebase'; // Adjust path to your firebase config
import { signOut } from 'firebase/auth';
import Box from '@mui/joy/Box';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Button from '@mui/joy/Button';
import UserInfo from './UserInfo';
import Settings from './Settings';
import { useNavigate } from 'react-router-dom'; // Ensure you're using react-router-dom

export default function MyProfile() {
  const [tabValue, setTabValue] = React.useState(0);
  const { currentUser } = useAuth(); // Get current user from AuthContext
  const navigate = useNavigate(); // React Router navigation

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Firebase sign-out
      navigate('/'); // Redirect to the Signin page
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: { sm: -100, md: -110 },
          bgcolor: 'background.body',
          zIndex: 9995,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ px: { xs: 2, md: 6 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0 }}
            >
              <Link underline="none" color="neutral" href="#some-link" aria-label="Home">
                <HomeRoundedIcon />
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
                My profile
              </Typography>
            </Breadcrumbs>
            <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
              My profile
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="danger"
            onClick={handleSignOut}
            sx={{
              alignSelf: 'center',
              height: '40px',
              fontWeight: '600',
            }}
          >
            Sign Out
          </Button>
        </Box>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ bgcolor: 'transparent' }}
        >
          <TabList
            tabFlex={1}
            size="sm"
            sx={{
              pl: { xs: 0, md: 4 },
              justifyContent: 'left',
              [`&& .${tabClasses.root}`]: {
                fontWeight: '600',
                flex: 'initial',
                color: 'text.tertiary',
                [`&.${tabClasses.selected}`]: {
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  '&::after': {
                    height: '2px',
                    bgcolor: 'primary.500',
                  },
                },
              },
            }}
          >
            <Tab sx={{ borderRadius: '6px 6px 0 0' }} indicatorInset value={0}>
              User info
            </Tab>
            <Tab sx={{ borderRadius: '6px 6px 0 0' }} indicatorInset value={1}>
              Settings
            </Tab>
          </TabList>
        </Tabs>
      </Box>
      {tabValue === 0 && <UserInfo />}
      {tabValue === 1 && <Settings />}
    </Box>
  );
}