import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        mb: 6, 
        bgcolor: 'white', 
        color: 'text.primary',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 70 }}>
          <Typography
            variant="h5"
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              fontWeight: 800,
              color: 'primary.main',
              letterSpacing: '-0.02em'
            }}
          >
            CampusConnect
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              variant={location.pathname === '/' ? 'contained' : 'text'}
              color={location.pathname === '/' ? 'primary' : 'inherit'}
              startIcon={<NotificationsIcon />}
              disableElevation
            >
              All
            </Button>
            <Button
              component={RouterLink}
              to="/priority"
              variant={location.pathname === '/priority' ? 'contained' : 'text'}
              color={location.pathname === '/priority' ? 'primary' : 'inherit'}
              startIcon={<StarIcon />}
              disableElevation
            >
              Priority
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
