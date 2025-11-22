import React, { Fragment, useState, useEffect } from 'react';
import TopNavbar from '../../Components/Topbar/TopNavbar';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Grid from '@mui/joy/Grid';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Chip from '@mui/joy/Chip';
import LinearProgress from '@mui/joy/LinearProgress';
import Skeleton from '@mui/joy/Skeleton';
import SoftCard from '../../Components/Cards/SoftCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import EmailIcon from '@mui/icons-material/Email';
import { db } from '../../../config/firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import logo from '../../../logo.png';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [todayStats, setTodayStats] = useState({
    reservations: 0,
    guests: 0,
    revenue: 0,
    occupancy: 0,
  });
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch recent contact messages
    const contactsRef = collection(db, 'contactForm');
    const contactsQuery = query(contactsRef, orderBy('timestamp', 'desc'), limit(5));

    const unsubscribe = onSnapshot(contactsQuery, (snapshot) => {
      const contacts = [];
      snapshot.forEach((doc) => {
        contacts.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setRecentContacts(contacts);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch real-time data from Firebase
    const allReservationsRef = collection(db, 'AllReservations');

    const unsubscribe = onSnapshot(allReservationsRef, (snapshot) => {
      const today = dayjs().startOf('day');
      const tomorrow = dayjs().add(1, 'day').startOf('day');
      
      let todayReservations = 0;
      let todayGuests = 0;
      let totalRevenue = 0;
      const upcomingList = [];
      const activityList = [];
      
      snapshot.forEach((doc) => {
        const reservation = doc.data();
        const reservationDate = dayjs(reservation.startDate);
        const reservationDateTime = dayjs(`${reservation.startDate} ${reservation.startTime}`);
        
        // Calculate today's stats
        if (reservationDate.isSame(today, 'day')) {
          todayReservations++;
          todayGuests += parseInt(reservation.persons) || 0;
          
          // Estimate revenue (you can adjust the calculation based on your business logic)
          // Assuming average spend per person is $40-60 CAD
          totalRevenue += (parseInt(reservation.persons) || 0) * 50;
        }
        
        // Get upcoming reservations (from now, sorted by time)
        if (reservationDateTime.isAfter(dayjs())) {
          upcomingList.push({
            id: doc.id,
            name: reservation.name,
            time: reservation.startTime,
            guests: parseInt(reservation.persons) || 0,
            status: reservation.status || 'confirmed',
            dateTime: reservationDateTime,
          });
        }
        
        // Create recent activity for today's new reservations
        if (reservationDate.isSame(today, 'day')) {
          activityList.push({
            id: doc.id,
            text: `New reservation from ${reservation.name}`,
            time: reservationDateTime.fromNow(),
            type: 'reservation',
            timestamp: reservationDateTime,
          });
        }
      });
      
      // Sort upcoming reservations by datetime
      upcomingList.sort((a, b) => a.dateTime.diff(b.dateTime));
      
      // Sort activities by timestamp (most recent first)
      activityList.sort((a, b) => b.timestamp.diff(a.timestamp));
      
      // Calculate occupancy (assuming 50 total seats/capacity)
      const totalCapacity = 100;
      const occupancyRate = Math.min(Math.round((todayGuests / totalCapacity) * 100), 100);
      
      // Update states
      setTodayStats({
        reservations: todayReservations,
        guests: todayGuests,
        revenue: totalRevenue,
        occupancy: occupancyRate,
      });
      
      setUpcomingReservations(upcomingList.slice(0, 3)); // Show top 3
      setRecentActivity(activityList.slice(0, 5)); // Show top 5
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Fragment>
      <TopNavbar />
      <Box
        sx={{
          pt: 8, // Space for TopNavbar
          pb: 2,
          px: 2,
          minHeight: '100vh',
          backgroundColor: 'background.level1',
        }}
      >
        {/* Logo and Greeting Section */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'white',
              boxShadow: 'md',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              flexShrink: 0,
            }}
          >
            <img 
              src={logo} 
              alt="Masakali Restrobar" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                borderRadius: '50%'
              }} 
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography level="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {greeting}! 👋
            </Typography>
            <Typography level="body-md" sx={{ color: 'neutral.600' }}>
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={6}>
            <Card
              variant="soft"
              color="primary"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                {loading ? (
                  <Skeleton variant="text" level="h2" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '60px', mx: 'auto' }} />
                ) : (
                  <Typography level="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {todayStats.reservations}
                  </Typography>
                )}
                <Typography level="body-sm" sx={{ color: 'white', opacity: 0.9 }}>
                  Today's Reservations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={6}>
            <Card
              variant="soft"
              color="success"
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                {loading ? (
                  <Skeleton variant="text" level="h2" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '60px', mx: 'auto' }} />
                ) : (
                  <Typography level="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {todayStats.guests}
                  </Typography>
                )}
                <Typography level="body-sm" sx={{ color: 'white', opacity: 0.9 }}>
                  Expected Guests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={6}>
            <Card
              variant="soft"
              color="warning"
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                <AttachMoneyIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                {loading ? (
                  <Skeleton variant="text" level="h2" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '80px', mx: 'auto' }} />
                ) : (
                  <Typography level="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    ${todayStats.revenue.toLocaleString('en-CA')}
                  </Typography>
                )}
                <Typography level="body-sm" sx={{ color: 'white', opacity: 0.9 }}>
                  Est. Revenue (Today)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={6}>
            <Card
              variant="soft"
              color="danger"
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                <RestaurantIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                {loading ? (
                  <Skeleton variant="text" level="h2" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '60px', mx: 'auto' }} />
                ) : (
                  <Typography level="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {todayStats.occupancy}%
                  </Typography>
                )}
                <Typography level="body-sm" sx={{ color: 'white', opacity: 0.9 }}>
                  Table Occupancy
                </Typography>
                {!loading && (
                  <LinearProgress
                    determinate
                    value={todayStats.occupancy}
                    sx={{
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={1.5}>
              <Grid xs={6}>
                <Button
                  variant="soft"
                  color="primary"
                  fullWidth
                  startDecorator={<AddCircleOutlineIcon />}
                  sx={{ py: 1.5 }}
                >
                  New Reservation
                </Button>
              </Grid>
              <Grid xs={6}>
                <Button
                  variant="soft"
                  color="success"
                  fullWidth
                  startDecorator={<CalendarMonthIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Calendar
                </Button>
              </Grid>
              <Grid xs={6}>
                <Button
                  variant="soft"
                  color="warning"
                  fullWidth
                  startDecorator={<BarChartIcon />}
                  sx={{ py: 1.5 }}
                >
                  Analytics
                </Button>
              </Grid>
              <Grid xs={6}>
                <Button
                  variant="soft"
                  color="danger"
                  fullWidth
                  startDecorator={<LocalOfferIcon />}
                  sx={{ py: 1.5 }}
                >
                  Special Offers
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                Next Reservations
              </Typography>
              <Chip size="sm" color="primary" variant="soft">
                {upcomingReservations.length} upcoming
              </Chip>
            </Box>

            {loading ? (
              <>
                <Skeleton variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 'sm' }} />
                <Skeleton variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 'sm' }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 'sm' }} />
              </>
            ) : upcomingReservations.length > 0 ? (
              upcomingReservations.map((reservation, index) => (
                <Card
                  key={reservation.id}
                  variant="soft"
                  sx={{
                    mb: index !== upcomingReservations.length - 1 ? 1.5 : 0,
                    '&:hover': {
                      boxShadow: 'sm',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease',
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {reservation.name.charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                          {reservation.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'neutral.600' }} />
                          <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                            {reservation.time}
                          </Typography>
                          <PeopleIcon sx={{ fontSize: 16, color: 'neutral.600', ml: 0.5 }} />
                          <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                            {reservation.guests} guests
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      size="sm"
                      color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                      variant="soft"
                    >
                      {reservation.status}
                    </Chip>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography level="body-md" sx={{ color: 'neutral.600' }}>
                  No upcoming reservations
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="title-lg" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Activity
            </Typography>

            {loading ? (
              <>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 'sm' }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 'sm' }} />
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 'sm' }} />
              </>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mb: index !== recentActivity.length - 1 ? 2 : 0,
                    pb: index !== recentActivity.length - 1 ? 2 : 0,
                    borderBottom: index !== recentActivity.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor:
                        activity.type === 'reservation'
                          ? 'primary.100'
                          : activity.type === 'alert'
                          ? 'warning.100'
                          : 'success.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {activity.type === 'reservation' ? (
                      <EventIcon sx={{ fontSize: 18, color: 'primary.500' }} />
                    ) : activity.type === 'alert' ? (
                      <NotificationsActiveIcon sx={{ fontSize: 18, color: 'warning.500' }} />
                    ) : (
                      <AttachMoneyIcon sx={{ fontSize: 18, color: 'success.500' }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="body-md" sx={{ fontWeight: 'md' }}>
                      {activity.text}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'neutral.500', mt: 0.5 }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography level="body-md" sx={{ color: 'neutral.600' }}>
                  No recent activity
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Contact Messages */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactMailIcon sx={{ color: 'primary.500' }} />
                <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                  Recent Contact Messages
                </Typography>
              </Box>
              <Chip size="sm" color="primary" variant="soft">
                {recentContacts.length}
              </Chip>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 'sm' }} />
                ))}
              </Box>
            ) : recentContacts.length > 0 ? (
              recentContacts.map((contact, index) => (
                <Box
                  key={contact.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: index !== recentContacts.length - 1 ? 2 : 0,
                    pb: index !== recentContacts.length - 1 ? 2 : 0,
                    borderBottom: index !== recentContacts.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'primary.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 18, color: 'primary.500' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography level="body-md" sx={{ fontWeight: 'md' }}>
                      {contact.name}
                    </Typography>
                    <Typography 
                      level="body-sm" 
                      sx={{ 
                        color: 'neutral.600', 
                        mt: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {contact.message}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'neutral.500', mt: 0.5 }}>
                      {contact.email} • {dayjs(contact.timestamp?.toDate()).fromNow()}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography level="body-md" sx={{ color: 'neutral.600' }}>
                  No contact messages yet
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Performance Insight - Only show if there are reservations */}
        {!loading && todayStats.reservations > 0 && (
          <Card
            variant="soft"
            color="success"
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StarIcon sx={{ fontSize: 32, color: 'warning.500' }} />
                <Box>
                  <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                    Great Work! 🎉
                  </Typography>
                  <Typography level="body-sm" sx={{ mt: 0.5 }}>
                    You have {todayStats.reservations} reservation{todayStats.reservations !== 1 ? 's' : ''} today with {todayStats.guests} guest{todayStats.guests !== 1 ? 's' : ''}!
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Fragment>
  );
};

export default Home;