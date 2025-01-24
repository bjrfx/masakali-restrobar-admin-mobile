import React, { useEffect, useState } from 'react';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import { AuthProvider, useAuth } from './config/AuthProvider'; // Import AuthProvider and AuthContext
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Add Routes and Route

const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const AppContent = () => {
  const isMobile = useDeviceType();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isMobile ? <MobileView /> : <DesktopView />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;