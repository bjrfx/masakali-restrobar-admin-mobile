import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  CardContent, 
  Input, 
  Select, 
  Option,
  Chip,
  IconButton,
  Sheet,
  Skeleton,
  Avatar,
  Divider
} from '@mui/joy';
import { db } from '../../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import TodayIcon from '@mui/icons-material/Today';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

const UpcomingReservations = () => {
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    const allReservationsRef = collection(db, 'AllReservations');

    const unsubscribe = onSnapshot(allReservationsRef, (snapshot) => {
      const today = dayjs().startOf('day');
      const reservationsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((reservation) => {
          const reservationDate = dayjs(reservation.startDate);
          return reservationDate.isSameOrAfter(today);
        });

      setUpcomingReservations(reservationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search logic
  const filteredReservations = useMemo(() => {
    let filtered = [...upcomingReservations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          reservation.name?.toLowerCase().includes(query) ||
          reservation.phoneNumber?.includes(query) ||
          reservation.startDate?.includes(query)
      );
    }

    // Period filter
    const today = dayjs().startOf('day');
    if (filterPeriod === 'today') {
      filtered = filtered.filter((r) => dayjs(r.startDate).isSame(today, 'day'));
    } else if (filterPeriod === 'week') {
      const endOfWeek = today.add(7, 'day');
      filtered = filtered.filter((r) => 
        dayjs(r.startDate).isBetween(today, endOfWeek, 'day', '[]')
      );
    } else if (filterPeriod === 'month') {
      const endOfMonth = today.add(30, 'day');
      filtered = filtered.filter((r) => 
        dayjs(r.startDate).isBetween(today, endOfMonth, 'day', '[]')
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = dayjs(`${a.startDate} ${a.startTime}`);
      const dateB = dayjs(`${b.startDate} ${b.startTime}`);

      switch (sortBy) {
        case 'date-asc':
          return dateA.diff(dateB);
        case 'date-desc':
          return dateB.diff(dateA);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'guests-desc':
          return parseInt(b.persons || 0) - parseInt(a.persons || 0);
        case 'guests-asc':
          return parseInt(a.persons || 0) - parseInt(b.persons || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [upcomingReservations, searchQuery, sortBy, filterPeriod]);

  const getDaysUntil = (date) => {
    const today = dayjs().startOf('day');
    const reservationDate = dayjs(date).startOf('day');
    const diff = reservationDate.diff(today, 'day');
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPeriod('all');
    setSortBy('date-asc');
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'background.level1',
        minHeight: 'calc(100vh - 140px)',
      }}
    >
      {/* Search and Filter Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search upcoming reservations..."
            startDecorator={<SearchIcon />}
            endDecorator={
              searchQuery && (
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setSearchQuery('')}
                >
                  <ClearIcon />
                </IconButton>
              )
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton
            variant={showFilters ? 'solid' : 'soft'}
            color="success"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Filter Panel */}
        {showFilters && (
          <Sheet
            variant="soft"
            color="success"
            sx={{
              p: 2,
              borderRadius: 'sm',
              mb: 2,
            }}
          >
            <Typography level="title-sm" sx={{ mb: 1.5 }}>
              Filters & Sorting
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 'md' }}>
                  Time Period
                </Typography>
                <Select
                  value={filterPeriod}
                  onChange={(e, value) => setFilterPeriod(value)}
                  size="sm"
                  startDecorator={<TodayIcon />}
                >
                  <Option value="all">All Upcoming</Option>
                  <Option value="today">Today</Option>
                  <Option value="week">Next 7 Days</Option>
                  <Option value="month">Next 30 Days</Option>
                </Select>
              </Box>

              <Box>
                <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 'md' }}>
                  Sort By
                </Typography>
                <Select
                  value={sortBy}
                  onChange={(e, value) => setSortBy(value)}
                  size="sm"
                  startDecorator={<SortIcon />}
                >
                  <Option value="date-asc">Date (Soonest First)</Option>
                  <Option value="date-desc">Date (Latest First)</Option>
                  <Option value="name-asc">Name (A-Z)</Option>
                  <Option value="name-desc">Name (Z-A)</Option>
                  <Option value="guests-desc">Guests (High to Low)</Option>
                  <Option value="guests-asc">Guests (Low to High)</Option>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography level="body-xs" color="neutral">
                  {filteredReservations.length} result{filteredReservations.length !== 1 ? 's' : ''}
                </Typography>
                <Typography
                  level="body-xs"
                  color="success"
                  sx={{ cursor: 'pointer', fontWeight: 'md' }}
                  onClick={clearFilters}
                >
                  Clear All
                </Typography>
              </Box>
            </Box>
          </Sheet>
        )}
      </Box>

      {/* Results Count */}
      <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
        {filteredReservations.length} upcoming reservation{filteredReservations.length !== 1 ? 's' : ''}
      </Typography>

      {/* Reservations List */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 'sm' }} />
          ))}
        </Box>
      ) : filteredReservations.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredReservations.map((reservation) => (
            <Card
              key={reservation.id}
              variant="outlined"
              sx={{
                borderLeft: '4px solid',
                borderLeftColor: dayjs(reservation.startDate).isSame(dayjs(), 'day') 
                  ? 'primary.500' 
                  : 'success.500',
                '&:hover': {
                  boxShadow: 'md',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <CardContent>
                {/* Header with Name and Countdown */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      }}
                    >
                      {reservation.name?.charAt(0).toUpperCase() || 'R'}
                    </Avatar>
                    <Box>
                      <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                        {reservation.name || 'N/A'}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                        ID: {reservation.id.slice(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="sm"
                    color={dayjs(reservation.startDate).isSame(dayjs(), 'day') ? 'primary' : 'success'}
                    variant="soft"
                  >
                    {getDaysUntil(reservation.startDate)}
                  </Chip>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Reservation Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'primary.500' }} />
                    <Typography level="body-sm">
                      <strong>Date:</strong> {dayjs(reservation.startDate).format('MMM DD, YYYY (dddd)')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: 'success.500' }} />
                    <Typography level="body-sm">
                      <strong>Time:</strong> {reservation.startTime || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: 'warning.500' }} />
                    <Typography level="body-sm">
                      <strong>Guests:</strong> {reservation.persons || 0} {parseInt(reservation.persons || 0) === 1 ? 'person' : 'people'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 18, color: 'danger.500' }} />
                    <Typography level="body-sm">
                      <strong>Phone:</strong> {reservation.phoneNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography level="h4" sx={{ mb: 1, color: 'neutral.500' }}>
            No Upcoming Reservations
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
            {searchQuery || filterPeriod !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No upcoming reservations scheduled'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UpcomingReservations;