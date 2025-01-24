import React from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';

export default function SoftCard({ title, description, number }) {
  return (
    <Card variant="soft" sx={{ textAlign: 'center', padding: 2 }}>
      <CardContent>
        {/* Large Number or Skeleton */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60px', // Ensures consistent card height while loading
          }}
        >
          {typeof number === 'number' || typeof number === 'string' ? (
            <Typography
              level="h1"
              sx={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'primary.500',
              }}
            >
              {number}
            </Typography>
          ) : (
            number // Renders JSX like <Skeleton />
          )}
        </Box>
        {/* Title */}
        <Typography level="title-md" sx={{ marginTop: 1, fontWeight: 'medium' }}>
          {title}
        </Typography>
        {/* Description */}
        <Typography level="body-sm" sx={{ marginTop: 1, color: 'neutral.600' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}