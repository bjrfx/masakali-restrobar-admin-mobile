import React, { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Book from "@mui/icons-material/Book";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import Archive from "@mui/icons-material/Archive";
import MenuBook from "@mui/icons-material/MenuBook";
import Person from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AppsIcon from '@mui/icons-material/Apps';
import { useAuth } from '../../../config/AuthProvider';
import { db } from '../../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Appbar = ({ activeTab, setActiveTab, selectedIcon, selectedColor }) => {
  const { currentUser } = useAuth();
  const colors = ["primary", "danger", "success", "warning", "info", "neutral", "primary"];
  const [isAppbarOpen, setIsAppbarOpen] = useState(false);
  const [fixedAppIcon, setFixedAppIcon] = useState(false);
  
  // Calculate fixed position (center bottom, above navbar)
  const getFixedPosition = () => ({
    x: window.innerWidth / 2 - 30, // Center horizontally (30 = half of circle width)
    y: window.innerHeight - 150, // 150px from bottom (above navbar)
  });
  
  const [position, setPosition] = useState(getFixedPosition()); // Default position
  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(null); // Track drag start position
  const [isClicking, setIsClicking] = useState(false); // Handle click animation

  // Listen to Firebase settings changes in real-time
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const isFixed = data.fixedAppIcon || false;
        setFixedAppIcon(isFixed);
        
        // If fixed, reset to center position
        if (isFixed) {
          setPosition(getFixedPosition());
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update fixed position on window resize
  useEffect(() => {
    if (!fixedAppIcon) return;

    const handleResize = () => {
      setPosition(getFixedPosition());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fixedAppIcon]);

  const toggleAppbar = () => {
    if (!dragging) {
      setIsAppbarOpen((prev) => !prev);
    }
  };

  const handleDrag = (e) => {
    if (fixedAppIcon) return; // Don't allow dragging if fixed
    
    const isTouch = e.type === "touchmove";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setPosition({
      x: clientX - 30, // Adjust based on circle size (radius = 30px)
      y: clientY - 30,
    });
    setDragging(true); // Mark as dragging
  };

  const handleDragEnd = (e) => {
    if (fixedAppIcon) return; // Don't allow dragging if fixed
    
    e.preventDefault();
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);

    if (startPosition) {
      const movedX = Math.abs(startPosition.x - position.x);
      const movedY = Math.abs(startPosition.y - position.y);
      if (movedX < 5 && movedY < 5) {
        setDragging(false); // If the movement is minimal, consider it a click
      }
    }
    setStartPosition(null); // Reset start position
  };

  const handleDragStart = (e) => {
    if (fixedAppIcon) return; // Don't allow dragging if fixed
    
    e.preventDefault();
    const isTouch = e.type === "touchstart";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setStartPosition({ x: clientX, y: clientY }); // Set drag start position
    setDragging(false); // Reset dragging state
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleClickAnimation = () => {
    setIsClicking(true);
    setTimeout(() => {
      setIsClicking(false);
    }, 200); // Reset after 200ms
  };

  // Liquid-glass effect for draggable circle
  const circleCSS = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.15)',
  };

  return (
    <>
      {/* Draggable Circle */}
      <Box 
        style={circleCSS}
        sx={{
          position: "fixed",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: fixedAppIcon ? "pointer" : "grab",
          touchAction: "none",
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: fixedAppIcon ? "all 0.3s ease" : "transform 0.2s ease, box-shadow 0.2s ease",
          transform: isClicking ? "scale(0.9)" : "scale(1)",
          '&:hover': {
            boxShadow: '0 12px 40px 0 rgba(102, 126, 234, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.25)',
            transform: 'scale(1.05)',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 1), rgba(118, 75, 162, 1))',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
        onMouseDown={(e) => {
          if (!fixedAppIcon) {
            handleDragStart(e);
          }
          handleClickAnimation();
        }}
        onTouchStart={(e) => {
          if (!fixedAppIcon) {
            handleDragStart(e);
          }
          handleClickAnimation();
        }}
        onMouseUp={() => !dragging && toggleAppbar()}
        onTouchEnd={() => !dragging && toggleAppbar()}
      >
        <AppsIcon
          sx={{
            color: "white",
            fontSize: "32px",
            filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))",
            transition: "all 0.2s ease",
          }}
        />
      </Box>

      {/* Appbar with Liquid-Glass Effect */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          transform: isAppbarOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease",
          p: 2,
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.85), rgba(20, 20, 40, 0.9))',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderBottom: 'none',
          boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflowX: "auto",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent)',
          },
        }}
      >
        <Tabs
          size="lg"
          aria-label="Bottom Navigation"
          value={activeTab}
          onChange={(event, value) => setActiveTab(value)}
          sx={(theme) => ({
            p: 1,
            borderRadius: 20,
            maxWidth: "100%",
            mx: "auto",
            boxShadow: 'none',
            display: "flex",
            whiteSpace: "nowrap",
            background: 'transparent',
            [`& .${tabClasses.root}`]: {
              py: 1,
              flex: "1 0 auto",
              flexDirection: "column",
              alignItems: "center",
              transition: "all 0.3s ease",
              fontWeight: "md",
              fontSize: "xs",
              color: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              [`&:not(.${tabClasses.selected}):not(:hover)`]: {
                opacity: 0.7,
              },
              [`&:hover`]: {
                background: 'rgba(102, 126, 234, 0.3)',
                backdropFilter: 'blur(10px)',
                transform: 'translateY(-2px)',
                color: 'white',
                opacity: 1,
              },
              [`&.${tabClasses.selected}`]: {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6))',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.5)',
                color: 'white',
                fontWeight: 'bold',
                transform: 'translateY(-4px)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              },
            },
          })}
        >
          <TabList
            variant="plain"
            size="sm"
            disableUnderline
            sx={{
              display: "flex",
              gap: 1,
              borderRadius: "lg",
              p: 0,
              flexWrap: "nowrap",
              overflowX: "auto",
              minWidth: "100%",
              background: 'transparent',
            }}
          >
            <Tab disableIndicator>
              <HomeRoundedIcon sx={{ fontSize: 28, mb: 0.5 }} />
              Home
            </Tab>
            <Tab disableIndicator>
              <Book sx={{ fontSize: 28, mb: 0.5 }} />
              Reservations
            </Tab>
            <Tab disableIndicator>
              <SubscriptionsIcon sx={{ fontSize: 28, mb: 0.5 }} />
              Subscriptions
            </Tab>
            <Tab disableIndicator>
              <Archive sx={{ fontSize: 28, mb: 0.5 }} />
              Archive
            </Tab>
            <Tab disableIndicator>
              <MenuBook sx={{ fontSize: 28, mb: 0.5 }} />
              Menu
            </Tab>
            <Tab disableIndicator>
              <ContactMailIcon sx={{ fontSize: 28, mb: 0.5 }} />
              Contact
            </Tab>
            <Tab disableIndicator>
              <Person sx={{ fontSize: 28, mb: 0.5 }} />
              Profile
            </Tab>
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};

export default Appbar;