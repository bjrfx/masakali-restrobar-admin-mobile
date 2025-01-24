import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../config/AuthProvider'; // Adjust path for your AuthContext
import { db, storage } from '../../../config/firebase'; // Adjust path to your Firebase config
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage functions
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import CountrySelector from './CountrySelector'; // Assume this is your country dropdown component
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Skeleton from '@mui/joy/Skeleton';
import IconButton from '@mui/joy/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

export default function UserInfo() {
  const { currentUser } = useAuth(); // Get the logged-in user's authentication data
  const [userData, setUserData] = useState(null); // null until data is fetched
  const [loading, setLoading] = useState(true); // General loading state
  const [uploading, setUploading] = useState(false); // Loading state for profile picture upload

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        } finally {
          setLoading(false); // Stop loading once the data is fetched
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleCountryChange = async (selectedCountry) => {
    if (currentUser?.uid) {
      try {
        // Update the selected country in Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), {
          country: selectedCountry,
        });
        setUserData((prevData) => ({ ...prevData, country: selectedCountry }));
        console.log('Country updated successfully to:', selectedCountry);
      } catch (error) {
        console.error('Error updating country:', error.message);
      }
    }
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file && currentUser?.uid) {
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
      setUploading(true);

      try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update the profile picture URL in Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), {
          profilePicture: downloadURL,
        });

        setUserData((prevData) => ({ ...prevData, profilePicture: downloadURL }));
        console.log('Profile picture updated successfully:', downloadURL);
      } catch (error) {
        console.error('Error uploading profile picture:', error.message);
      } finally {
        setUploading(false); // Stop the uploading state
      }
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        mx: 'auto',
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 3 },
        height: '100vh'
      }}
    >
      <Box>
        <Typography level="title-md" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
          Personal Info
        </Typography>
        <Typography
          level="body-sm"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, mt: 1, mb: 2 }}
        >
          View your profile information. Some details are not editable.
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={40} />
          </Stack>
        ) : (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 4 }}
          >
            {/* Profile Picture Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {uploading ? (
                <Skeleton
                  variant="circular"
                  width={120}
                  height={120}
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    borderRadius: '100%',
                  }}
                />
              ) : (
                <AspectRatio
                  ratio="1"
                  maxHeight={200}
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    width: { xs: 120, sm: 150 },
                    borderRadius: '100%',
                  }}
                >
                  <img
                    src={
                      userData?.profilePicture ||
                      'https://via.placeholder.com/150?text=Profile+Picture'
                    }
                    alt="Profile"
                  />
                </AspectRatio>
              )}
              <IconButton
                aria-label="Upload profile picture"
                size="sm"
                component="label"
                variant="outlined"
                color="neutral"
                sx={{
                  position: 'absolute',
                  zIndex: 2,
                  bottom: 10,
                  right: { xs: '55%', md: '45%' },
                }}
              >
                <EditRoundedIcon />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfilePicChange}
                />
              </IconButton>
            </Box>

            {/* Form Section */}
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {/* Name Fields */}
              <Stack spacing={1}>
                <FormLabel>Name</FormLabel>
                <FormControl
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1, md: 2 },
                  }}
                >
                  <Input
                    size="sm"
                    value={userData?.firstName || ''}
                    disabled
                    placeholder="First name"
                  />
                  <Input
                    size="sm"
                    value={userData?.lastName || ''}
                    disabled
                    placeholder="Last name"
                    sx={{ flexGrow: 1 }}
                  />
                </FormControl>
              </Stack>

              {/* Role and Email Fields */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Input
                    size="sm"
                    value={userData?.role || ''}
                    disabled
                    placeholder="Role"
                  />
                </FormControl>
                <FormControl sx={{ flexGrow: 1 }}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    size="sm"
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    startDecorator={<EmailRoundedIcon />}
                    placeholder="Email"
                  />
                </FormControl>
              </Stack>

              {/* Country Selector */}
              <Stack spacing={1}>
                <CountrySelector
                  selectedCountry={userData?.country || ''}
                  onChange={handleCountryChange}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
}