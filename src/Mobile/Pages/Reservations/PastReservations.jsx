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
import HistoryIcon from '@mui/icons-material/History';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PastReservations = () => {
  const [pastReservations, setPastReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
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
          return reservationDate.isBefore(today);
        });

      setPastReservations(reservationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search logic
  const filteredReservations = useMemo(() => {
    let filtered = [...pastReservations];

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
    if (filterPeriod === 'yesterday') {
      const yesterday = today.subtract(1, 'day');
      filtered = filtered.filter((r) => dayjs(r.startDate).isSame(yesterday, 'day'));
    } else if (filterPeriod === 'week') {
      const weekAgo = today.subtract(7, 'day');
      filtered = filtered.filter((r) => 
        dayjs(r.startDate).isBetween(weekAgo, today, 'day', '[)')
      );
    } else if (filterPeriod === 'month') {
      const monthAgo = today.subtract(30, 'day');
      filtered = filtered.filter((r) => 
        dayjs(r.startDate).isBetween(monthAgo, today, 'day', '[)')
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = dayjs(`${a.startDate} ${a.startTime}`);
      const dateB = dayjs(`${b.startDate} ${b.startTime}`);

      switch (sortBy) {
        case 'date-desc':
          return dateB.diff(dateA);
        case 'date-asc':
          return dateA.diff(dateB);
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
  }, [pastReservations, searchQuery, sortBy, filterPeriod]);

  const getTimeAgo = (date) => {
    return dayjs(date).fromNow();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPeriod('all');
    setSortBy('date-desc');
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
            placeholder="Search past reservations..."
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
            color="neutral"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
          </IconButton>
        </Box>

        {/* Filter Panel */}
        {showFilters && (
          <Sheet
            variant="soft"
            color="neutral"
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
                  startDecorator={<HistoryIcon />}
                >
                  <Option value="all">All Past</Option>
                  <Option value="yesterday">Yesterday</Option>
                  <Option value="week">Last 7 Days</Option>
                  <Option value="month">Last 30 Days</Option>
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
                  <Option value="date-desc">Date (Most Recent)</Option>
                  <Option value="date-asc">Date (Oldest First)</Option>
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
                  color="neutral"
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
        {filteredReservations.length} past reservation{filteredReservations.length !== 1 ? 's' : ''}
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
                opacity: 0.9,
                borderLeft: '4px solid',
                borderLeftColor: 'neutral.300',
                '&:hover': {
                  opacity: 1,
                  boxShadow: 'md',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <CardContent>
                {/* Header with Name and Time Ago */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #89216B 0%, #DA4453 100%)',
                        opacity: 0.8,
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
                    color="neutral"
                    variant="soft"
                    startDecorator={<HistoryIcon />}
                  >
                    {getTimeAgo(reservation.startDate)}
                  </Chip>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Reservation Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'neutral.500' }} />
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                      <strong>Date:</strong> {dayjs(reservation.startDate).format('MMM DD, YYYY (dddd)')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: 'neutral.500' }} />
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                      <strong>Time:</strong> {reservation.startTime || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: 'neutral.500' }} />
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                      <strong>Guests:</strong> {reservation.persons || 0} {parseInt(reservation.persons || 0) === 1 ? 'person' : 'people'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 18, color: 'neutral.500' }} />
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
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
            No Past Reservations
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
            {searchQuery || filterPeriod !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No past reservations found'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PastReservations;