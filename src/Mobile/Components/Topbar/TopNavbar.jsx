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
        background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.85), rgba(20, 20, 40, 0.9))',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent)',
        },
      }}
    >
      {/* Left side: User's Name and "Dashboard" */}
      <Typography 
        level="h5" 
        sx={{ 
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
        }}
      >
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
          border: '2px solid rgba(102, 126, 234, 0.8)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(102, 126, 234, 1)',
          },
        }}
      />
    </Box>
  );
}