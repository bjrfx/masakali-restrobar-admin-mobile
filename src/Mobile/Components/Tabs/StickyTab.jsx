import * as React from 'react';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';

export default function StickyTab({ reservation, allReservations, upcomingReservations, pastReservations }) {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Tabs
      aria-label="Horizontal Scrollable Tabs"
      value={selectedTab}
      onChange={(event, newValue) => setSelectedTab(newValue)}
      sx={{
        position: 'sticky', // Ensure tabs stay on top
        top: 0, // Stick to the top of the viewport
        zIndex: 10, // Ensure tabs are above other content
        backgroundColor: 'white', // Background color to ensure visibility
        p: 1,
        mt: 8,
      }}
    >
      <TabList
        variant="soft"
        sx={{
          display: 'flex',
          overflowX: 'auto', // Enable horizontal scrolling
          whiteSpace: 'nowrap', // Prevent wrapping
          scrollbarWidth: 'thin', // Thin scrollbar for better UX
          gap: 2, // Add spacing between tabs
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: '4px',
          },
        }}
      >
        <Tab value={0} sx={{ flexShrink: 0 }}>Reservations</Tab>
        <Tab value={1} sx={{ flexShrink: 0 }}>All Reservations</Tab>
        <Tab value={2} sx={{ flexShrink: 0 }}>Upcoming Reservations</Tab>
        <Tab value={3} sx={{ flexShrink: 0 }}>Past Reservations</Tab>
      </TabList>

      <TabPanel value={0} sx={{ mt: 2 }}>
        {reservation}
      </TabPanel>
      <TabPanel value={1} sx={{ mt: 2 }}>
        {allReservations}
      </TabPanel>
      <TabPanel value={2} sx={{ mt: 2 }}>
        {upcomingReservations}
      </TabPanel>
      <TabPanel value={3} sx={{ mt: 2 }}>
        {pastReservations}
      </TabPanel>
    </Tabs>
  );
}