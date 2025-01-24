import React, { useEffect, useState } from 'react';
import { Card, Typography, CardContent } from '@mui/joy';
import { db } from '../../../config/firebase'; // Import Firebase configuration
import { collection, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs'; // For date comparison

const UpcomingReservations = () => {
  const [upcomingReservations, setUpcomingReservations] = useState([]); // State for upcoming reservations
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    const allReservationsRef = collection(db, 'AllReservations'); // Reference to Firestore collection

    // Real-time listener for Firestore updates
    const unsubscribe = onSnapshot(allReservationsRef, (snapshot) => {
      const today = dayjs().startOf('day').toDate(); // Get today's date at midnight
      const reservationsData = snapshot.docs
        .map((doc) => ({
          id: doc.id, // Document ID
          ...doc.data(), // Document fields
        }))
        .filter((reservation) => {
          const reservationDate = new Date(reservation.startDate); // Convert startDate to Date object
          return reservationDate >= today; // Filter upcoming reservations
        });

      setUpcomingReservations(reservationsData); // Update state with upcoming reservations
      setLoading(false); // Stop loading
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f5f5f5',
        height: 'calc(100vh - 64px)', // Ensure content doesn't block tabs
        overflowY: 'auto', // Allow scrolling for content
        position: 'relative', // Ensure no overlapping with tabs
      }}
    >
      {loading ? (
        <Typography>Loading...</Typography> // Display loading message while data is being fetched
      ) : upcomingReservations.length > 0 ? (
        upcomingReservations.map((reservation) => (
          <Card
            key={reservation.id}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
            }}
          >
            <CardContent>
              <Typography level="h6" sx={{ fontWeight: 'bold' }}>
                {reservation.name}
              </Typography>
              <Typography>
                <strong>Persons:</strong> {reservation.persons}
              </Typography>
              <Typography>
                <strong>Phone Number:</strong> {reservation.phoneNumber}
              </Typography>
              <Typography>
                <strong>Date:</strong> {reservation.startDate}
              </Typography>
              <Typography>
                <strong>Time:</strong> {reservation.startTime}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No upcoming reservations found.</Typography> // Message for empty reservation list
      )}
    </div>
  );
};

export default UpcomingReservations;