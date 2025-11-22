import React, { useState } from 'react';
import { useAuth } from './config/AuthProvider'; // Import AuthContext
import Appbar from './Mobile/Components/Appbar/Appbar';
import Home from './Mobile/Pages/Home/Home';
import Reservations from './Mobile/Pages/Reservations/Reservations';
import Subscriptions from './Mobile/Pages/Subscriptions/Subscriptions';
import Archive from './Mobile/Pages/Archive/Archive';
import Menu from './Mobile/Pages/Menu/Menu';
import ContactForm from './Mobile/Pages/ContactForm/ContactForm';
import Profile from './Mobile/Pages/Profile/Profile';
import Signin from './Common/Pages/Signin/Signin';
import Signup from './Common/Pages/Signup/Signup';

const MobileView = () => {
  const { currentUser } = useAuth(); // Get the current user from AuthContext
  const [activeTab, setActiveTab] = useState(0);
  const [authState, setAuthState] = useState('signin'); // Manage 'signin' or 'signup' state

  const renderContent = () => {
    // If the user is not authenticated, show Signin or Signup
    if (!currentUser) {
      return authState === 'signin' ? (
        <Signin onSignup={() => setAuthState('signup')} />
      ) : (
        <Signup onSignin={() => setAuthState('signin')} />
      );
    }

    // Render the main app content when the user is authenticated
    switch (activeTab) {
      case 0:
        return <Home />;
      case 1:
        return <Reservations />;
      case 2:
        return <Subscriptions />;
      case 3:
        return <Archive />;
      case 4:
        return <Menu />;
      case 5:
        return <ContactForm />;
      case 6:
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: currentUser ? '64px' : '0', // Ensure space for Appbar only when logged in
        }}
      >
        {renderContent()}
      </div>

      {currentUser && <Appbar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default MobileView;