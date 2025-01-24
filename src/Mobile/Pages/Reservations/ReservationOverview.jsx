import React, { useEffect, useState } from 'react';
import { Box, Skeleton } from '@mui/joy';
import SoftCard from '../../Components/Cards/SoftCard';
import { db } from '../../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import dayjs from 'dayjs';

const ReservationOverview = () => {
  const [allReservationsCount, setAllReservationsCount] = useState(null);
  const [upcomingReservationsCount, setUpcomingReservationsCount] = useState(null);
  const [pastReservationsCount, setPastReservationsCount] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservationsData = () => {
      const allReservationsRef = collection(db, 'AllReservations');

      const unsubscribe = onSnapshot(allReservationsRef, (snapshot) => {
        const totalReservations = snapshot.size;

        const today = dayjs().startOf('day').toDate();
        let upcomingCount = 0;
        let pastCount = 0;

        snapshot.forEach((doc) => {
          const reservation = doc.data();
          const reservationDate = new Date(reservation.startDate);

          if (reservationDate >= today) {
            upcomingCount++;
          } else {
            pastCount++;
          }
        });

        setAllReservationsCount(totalReservations);
        setUpcomingReservationsCount(upcomingCount);
        setPastReservationsCount(pastCount);
      });

      return () => unsubscribe();
    };

    fetchReservationsData();
  }, []);

  return (
    <Box
      
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: '#f5f5f5',
        minHeight: '90vh',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2,
        }}
      >
        <SoftCard
          title="All Reservations"
          description="View all reservations in one place."
          number={
            allReservationsCount !== null ? (
              allReservationsCount
            ) : (
              <Skeleton width="40px" height="24px" />
            )
          }
          onClick={() => navigate('/all-reservations')}
        />
        <SoftCard
          title="Upcoming Reservations"
          description="See what's next on your schedule."
          number={
            upcomingReservationsCount !== null ? (
              upcomingReservationsCount
            ) : (
              <Skeleton width="40px" height="24px" />
            )
          }
          onClick={() => navigate('/upcoming-reservations')}
        />
        <SoftCard
          title="Past Reservations"
          description="Check out your past reservations."
          number={
            pastReservationsCount !== null ? (
              pastReservationsCount
            ) : (
              <Skeleton width="40px" height="24px" />
            )
          }
          onClick={() => navigate('/past-reservations')}
        />
      </Box>
    </Box>
  );
};

export default ReservationOverview;