import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../config/AuthProvider'; // Adjust path for your AuthContext
import { db } from '../../../config/firebase'; // Adjust path to your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';

export default function TopNavbar({ onProfileClick }) {
  const { currentUser } = useAuth(); // Get the logged-in user's data
  const [userData, setUserData] = useState(null); // User data from Firestore
  const [loading, setLoading] = useState(true); // Loading state for user data

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'background.body',
        boxShadow: 'sm',
        zIndex: 1200, // Ensure it is above other components
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
      }}
    >
      {/* Left side: User's Name and "Dashboard" */}
      <Typography level="h5" sx={{ fontWeight: 'bold' }}>
        {loading ? 'Loading...' : `${userData?.firstName || 'User'}'s Dashboard`}
      </Typography>

      {/* Right side: Profile Picture */}
      <Avatar
        src={
          loading
            ? ''
            : userData?.profilePicture ||
              'https://via.placeholder.com/40?text=User' // Placeholder image
        }
        alt="Profile"
        onClick={onProfileClick} // Navigate to Profile tab
        sx={{
          cursor: 'pointer',
          width: 40,
          height: 40,
          border: '2px solid',
          borderColor: 'primary.500',
        }}
      />
    </Box>
  );
}