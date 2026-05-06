import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
          >
            Campus Connect
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={<NotificationsIcon />}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
                borderRadius: 0
              }}
            >
              All
            </Button>
            <Button
              component={RouterLink}
              to="/priority"
              color="inherit"
              startIcon={<StarIcon />}
              sx={{ 
                borderBottom: location.pathname === '/priority' ? '2px solid white' : 'none',
                borderRadius: 0
              }}
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
