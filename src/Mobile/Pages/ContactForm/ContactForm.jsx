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
import TopNavbar from '../../Components/Topbar/TopNavbar';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ContactForm = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const contactFormRef = collection(db, 'contactForm');

    const unsubscribe = onSnapshot(contactFormRef, (snapshot) => {
      const contactsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setContacts(contactsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.message?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.id.localeCompare(a.id); // Newer first (assuming ID is timestamp-based)
        case 'date-asc':
          return a.id.localeCompare(b.id); // Older first
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [contacts, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('date-desc');
  };

  return (
    <Box>
      <TopNavbar />
      <Box
        sx={{
          pt: 8,
          p: 2,
          backgroundColor: 'background.level1',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Contact Messages 💬
          </Typography>
          <Typography level="body-md" sx={{ color: 'neutral.600' }}>
            All customer inquiries and messages
          </Typography>
        </Box>

        {/* Search and Filter Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Input
              placeholder="Search by name, email, or message..."
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
              color="primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterListIcon />
            </IconButton>
          </Box>

          {/* Filter Panel */}
          {showFilters && (
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: 'sm',
                mb: 2,
              }}
            >
              <Typography level="title-sm" sx={{ mb: 1.5 }}>
                Sorting
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                    <Option value="date-desc">Newest First</Option>
                    <Option value="date-asc">Oldest First</Option>
                    <Option value="name-asc">Name (A-Z)</Option>
                    <Option value="name-desc">Name (Z-A)</Option>
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography level="body-xs" color="neutral">
                    {filteredContacts.length} message{filteredContacts.length !== 1 ? 's' : ''}
                  </Typography>
                  <Typography
                    level="body-xs"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 'md' }}
                    onClick={clearFilters}
                  >
                    Clear All
                  </Typography>
                </Box>
              </Box>
            </Sheet>
          )}

          {/* Active Filters Display */}
          {(searchQuery || sortBy !== 'date-desc') && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {searchQuery && (
                <Chip
                  size="sm"
                  endDecorator={<ClearIcon />}
                  onClick={() => setSearchQuery('')}
                >
                  Search: {searchQuery}
                </Chip>
              )}
              {sortBy !== 'date-desc' && (
                <Chip
                  size="sm"
                  color="neutral"
                  endDecorator={<ClearIcon />}
                  onClick={() => setSortBy('date-desc')}
                >
                  Sorted
                </Chip>
              )}
            </Box>
          )}
        </Box>

        {/* Results Count */}
        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Showing {filteredContacts.length} of {contacts.length} message{contacts.length !== 1 ? 's' : ''}
        </Typography>

        {/* Contacts List */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 'sm' }} />
            ))}
          </Box>
        ) : filteredContacts.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                variant="outlined"
                sx={{
                  borderLeft: '4px solid',
                  borderLeftColor: 'primary.500',
                  '&:hover': {
                    boxShadow: 'md',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <CardContent>
                  {/* Header with Name */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        {contact.name?.charAt(0).toUpperCase() || 'C'}
                      </Avatar>
                      <Box>
                        <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                          {contact.name || 'Anonymous'}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                          ID: {contact.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      size="sm"
                      color="primary"
                      variant="soft"
                      startDecorator={<ContactMailIcon />}
                    >
                      New
                    </Chip>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Contact Details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, color: 'primary.500' }} />
                      <Typography level="body-sm">
                        <strong>Email:</strong> {contact.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageIcon sx={{ fontSize: 18, color: 'success.500' }} />
                        <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                          Message:
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: 'background.level2',
                          borderRadius: 'sm',
                          borderLeft: '3px solid',
                          borderLeftColor: 'success.300',
                        }}
                      >
                        <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {contact.message || 'No message provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ContactMailIcon sx={{ fontSize: 64, color: 'neutral.300', mb: 2 }} />
            <Typography level="h4" sx={{ mb: 1, color: 'neutral.500' }}>
              No Contact Messages Found
            </Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'No customer messages available yet'}
            </Typography>
          </Box>
        )}

        {/* Stats Card */}
        {!loading && contacts.length > 0 && (
          <Card
            variant="soft"
            color="primary"
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ContactMailIcon sx={{ fontSize: 32 }} />
                <Box>
                  <Typography level="title-md" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Total Messages Received
                  </Typography>
                  <Typography level="h2" sx={{ color: 'white', mt: 0.5 }}>
                    {contacts.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ContactForm;
