import React, { Fragment } from 'react';
import TopNavbar from '../../Components/Topbar/TopNavbar';
import StickyTab from '../../Components/Tabs/StickyTab';
import ReservationOverview from './ReservationOverview';
import AllReservations from './AllReservations'; // Ensure these components exist
import UpcomingReservations from './UpcomingReservations';
import PastReservations from './PastReservations';

const Reservations = () => {
  return (
    <Fragment>
      <TopNavbar />
      <StickyTab
        reservation={<ReservationOverview />}
        allReservations={<AllReservations />}
        upcomingReservations={<UpcomingReservations />}
        pastReservations={<PastReservations />}
      />
    </Fragment>
  );
};

export default Reservations;