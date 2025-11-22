import React, { useEffect, useState } from 'react';
import { Box, Skeleton, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/joy';
import { db } from '../../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import dayjs from 'dayjs';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ReservationOverview = () => {
  const [allReservationsCount, setAllReservationsCount] = useState(null);
  const [upcomingReservationsCount, setUpcomingReservationsCount] = useState(null);
  const [pastReservationsCount, setPastReservationsCount] = useState(null);
  const [todayReservationsCount, setTodayReservationsCount] = useState(null);
  const [totalGuests, setTotalGuests] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservationsData = () => {
      const allReservationsRef = collection(db, 'AllReservations');

      const unsubscribe = onSnapshot(allReservationsRef, (snapshot) => {
        const totalReservations = snapshot.size;

        const today = dayjs().startOf('day');
        let upcomingCount = 0;
        let pastCount = 0;
        let todayCount = 0;
        let guestsCount = 0;

        snapshot.forEach((doc) => {
          const reservation = doc.data();
          const reservationDate = dayjs(reservation.startDate);

          guestsCount += parseInt(reservation.persons || 0);

          if (reservationDate.isSame(today, 'day')) {
            todayCount++;
            upcomingCount++;
          } else if (reservationDate.isAfter(today)) {
            upcomingCount++;
          } else {
            pastCount++;
          }
        });

        setAllReservationsCount(totalReservations);
        setUpcomingReservationsCount(upcomingCount);
        setPastReservationsCount(pastCount);
        setTodayReservationsCount(todayCount);
        setTotalGuests(guestsCount);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchReservationsData();
  }, []);

  const StatCard = ({ title, count, icon, color, gradient, trend }) => (
    <Card
      variant="soft"
      sx={{
        background: gradient,
        color: 'white',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box sx={{ fontSize: 40, mb: 1, opacity: 0.9 }}>
          {icon}
        </Box>
        {loading ? (
          <Skeleton variant="text" level="h2" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '80px', mx: 'auto' }} />
        ) : (
          <>
            <Typography level="h2" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
              {count || 0}
            </Typography>
            <Typography level="body-sm" sx={{ color: 'white', opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                {trend.direction === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16 }} />
                )}
                <Typography level="body-xs" sx={{ color: 'white', opacity: 0.9 }}>
                  {trend.text}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const upcomingPercentage = allReservationsCount > 0 
    ? Math.round((upcomingReservationsCount / allReservationsCount) * 100) 
    : 0;

  const pastPercentage = allReservationsCount > 0 
    ? Math.round((pastReservationsCount / allReservationsCount) * 100) 
    : 0;

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'background.level1',
        minHeight: 'calc(100vh - 140px)',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography level="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Reservation Overview
        </Typography>
        <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
          Complete summary of your restaurant reservations
        </Typography>
      </Box>

      {/* Main Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={6}>
          <StatCard
            title="All Reservations"
            count={allReservationsCount}
            icon={<EventIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>

        <Grid xs={6}>
          <StatCard
            title="Today's Bookings"
            count={todayReservationsCount}
            icon={<CalendarMonthIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            trend={{ direction: 'up', text: 'Active today' }}
          />
        </Grid>

        <Grid xs={6}>
          <StatCard
            title="Upcoming"
            count={upcomingReservationsCount}
            icon={<EventAvailableIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>

        <Grid xs={6}>
          <StatCard
            title="Past"
            count={pastReservationsCount}
            icon={<HistoryIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </Grid>
      </Grid>

      {/* Additional Insights */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <PeopleIcon sx={{ fontSize: 32, color: 'primary.500' }} />
            <Box sx={{ flex: 1 }}>
              <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                Total Guests
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                Across all reservations
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={32} />
            ) : (
              <Typography level="h3" sx={{ fontWeight: 'bold', color: 'primary.500' }}>
                {totalGuests || 0}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-md" sx={{ fontWeight: 'bold', mb: 2 }}>
            Reservation Distribution
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                Upcoming Reservations
              </Typography>
              <Typography level="body-sm" sx={{ fontWeight: 'bold', color: 'success.500' }}>
                {upcomingPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={upcomingPercentage}
              color="success"
              sx={{ height: 8 }}
            />
            <Typography level="body-xs" sx={{ color: 'neutral.500', mt: 0.5 }}>
              {upcomingReservationsCount || 0} reservations scheduled
            </Typography>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                Past Reservations
              </Typography>
              <Typography level="body-sm" sx={{ fontWeight: 'bold', color: 'neutral.500' }}>
                {pastPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={pastPercentage}
              color="neutral"
              sx={{ height: 8 }}
            />
            <Typography level="body-xs" sx={{ color: 'neutral.500', mt: 0.5 }}>
              {pastReservationsCount || 0} completed reservations
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      {!loading && allReservationsCount > 0 && (
        <Card
          variant="soft"
          color="success"
          sx={{
            mt: 2,
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          }}
        >
          <CardContent>
            <Typography level="title-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              📊 Quick Insight
            </Typography>
            <Typography level="body-sm">
              {upcomingReservationsCount > pastReservationsCount
                ? `You have more upcoming reservations than completed ones. Great momentum!`
                : `You've completed ${pastReservationsCount} reservations. Keep up the good work!`}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReservationOverview;