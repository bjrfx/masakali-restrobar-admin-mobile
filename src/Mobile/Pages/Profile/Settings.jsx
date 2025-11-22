import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Switch from '@mui/joy/Switch';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import { useAuth } from '../../../config/AuthProvider';
import { db } from '../../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const { currentUser } = useAuth();
  const [fixedAppIcon, setFixedAppIcon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setFixedAppIcon(data.fixedAppIcon || false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  // Save settings to Firebase
  const handleToggleFixedIcon = async (checked) => {
    if (!currentUser) return;

    setFixedAppIcon(checked);
    setSaving(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { fixedAppIcon: checked }, { merge: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      // Revert on error
      setFixedAppIcon(!checked);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        mx: 'auto',
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 3 },
        pb: 12,
      }}
    >
      <Typography level="h4" component="h2" sx={{ mb: 1 }}>
        Settings
      </Typography>
      <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage your account settings here.
      </Typography>

      <Card
        variant="outlined"
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 255, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography level="title-lg" sx={{ mb: 2, fontWeight: 'bold' }}>
          App Appearance
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography level="title-md" sx={{ mb: 0.5, fontWeight: '600' }}>
              Fixed App Icon
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              When enabled, the app icon will be fixed in the center-bottom position instead of being draggable.
            </Typography>
          </Box>
          <Switch
            checked={fixedAppIcon}
            onChange={(e) => handleToggleFixedIcon(e.target.checked)}
            disabled={saving}
            color={fixedAppIcon ? 'primary' : 'neutral'}
            sx={{
              mt: 0.5,
              '--Switch-trackWidth': '48px',
              '--Switch-trackHeight': '28px',
              '--Switch-thumbSize': '22px',
            }}
          />
        </Box>

        {saving && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size="sm" />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Saving...
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}