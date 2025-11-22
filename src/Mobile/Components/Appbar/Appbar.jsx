import React, { useState } from "react";
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
const Appbar = ({ activeTab, setActiveTab, selectedIcon, selectedColor }) => {
  const colors = ["primary", "danger", "success", "warning", "info", "neutral", "primary"];
  const [isAppbarOpen, setIsAppbarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight - 100 }); // Default to bottom-left
  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(null); // Track drag start position
  const [isClicking, setIsClicking] = useState(false); // Handle click animation

  const toggleAppbar = () => {
    if (!dragging) {
      setIsAppbarOpen((prev) => !prev);
    }
  };

  const handleDrag = (e) => {
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
//   Draggable Circle Color CSS
  const circleCSS = {
    backgroundColor: 'black',
    opacity: 0.5,
    // shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

  return (
    <>
      {/* Draggable Circle */}
      <Box style = {circleCSS}
        sx={{
          position: "fixed",
          zIndex: 9999, // Ensure it's above everything else
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "primary.500",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "grab",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          touchAction: "none", // Prevent touch scrolling while dragging
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: isClicking ? "scale(0.9)" : "scale(1)", // Clicking animation
        }}
        onMouseDown={(e) => {
          handleDragStart(e);
          handleClickAnimation();
        }}
        onTouchStart={(e) => {
          handleDragStart(e);
          handleClickAnimation();
        }}
        onMouseUp={() => !dragging && toggleAppbar()}
        onTouchEnd={() => !dragging && toggleAppbar()}
      >
        {isAppbarOpen ? (
          <AppsIcon
            sx={{
              color: "white",
              fontSize: "30px",
            //   opacity: dragging ? 0.6 : 1, // Lower opacity while dragging
              transition: "opacity 0.2s ease",
            }}
          />
        ) : (
          <AppsIcon
            sx={{
              color: "white",
              fontSize: "30px",
            //   opacity: dragging ? 0.6 : 1, // Lower opacity while dragging
              transition: "opacity 0.2s ease",
            }}
          />
        )}
      </Box>

      {/* Appbar */}
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
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          bgcolor: `${"var(--colors-index)"}.500`,
          overflowX: "auto",
        }}
        style={{ "--colors-index": colors[activeTab % colors.length] }}
      >
        <Tabs
          size="lg"
          aria-label="Bottom Navigation"
          value={activeTab}
          onChange={(event, value) => setActiveTab(value)}
          sx={(theme) => ({
            p: 1,
            borderRadius: 16,
            maxWidth: "100%",
            mx: "auto",
            boxShadow: theme.shadow.sm,
            display: "flex",
            whiteSpace: "nowrap",
            "--joy-shadowChannel":
              theme.vars.palette[colors[activeTab % colors.length]]
                ? theme.vars.palette[colors[activeTab % colors.length]]
                    .darkChannel
                : theme.vars.palette.primary.darkChannel,
            [`& .${tabClasses.root}`]: {
              py: 1,
              flex: "1 0 auto",
              flexDirection: "column", // Stack icon and text vertically
              alignItems: "center", // Center-align content
              transition: "0.3s",
              fontWeight: "md",
              fontSize: "md",
              [`&:not(.${tabClasses.selected}):not(:hover)`]: {
                opacity: 0.7,
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
            }}
          >
            <Tab disableIndicator {...(activeTab === 0 && { color: colors[0] })}>
              <HomeRoundedIcon sx={{ fontSize: 30 }} />
              Home
            </Tab>
            <Tab disableIndicator {...(activeTab === 1 && { color: colors[1] })}>
              <Book sx={{ fontSize: 30 }} />
              Reservations
            </Tab>
            <Tab disableIndicator {...(activeTab === 2 && { color: colors[2] })}>
              <SubscriptionsIcon sx={{ fontSize: 30 }} />
              Subscriptions
            </Tab>
            <Tab disableIndicator {...(activeTab === 3 && { color: colors[3] })}>
              <Archive sx={{ fontSize: 30 }} />
              Archive
            </Tab>
            <Tab disableIndicator {...(activeTab === 4 && { color: colors[4] })}>
              <MenuBook sx={{ fontSize: 30 }} />
              Menu
            </Tab>
            <Tab disableIndicator {...(activeTab === 5 && { color: colors[5] })}>
              <ContactMailIcon sx={{ fontSize: 30 }} />
              Contact
            </Tab>
            <Tab disableIndicator {...(activeTab === 6 && { color: colors[6] })}>
              <Person sx={{ fontSize: 30 }} />
              Profile
            </Tab>
          </TabList>
        </Tabs>
      </Box>
    </>
  );
};

export default Appbar;