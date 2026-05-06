import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Select, MenuItem, FormControl, 
  InputLabel, Pagination, CircularProgress, Alert 
} from '@mui/material';
import { getNotifications } from '../api/client';
import NotificationCard from '../components/NotificationCard';
import { log } from '../utils/logger';

const AllNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load viewed state from localStorage
    const saved = localStorage.getItem('viewed_notifications');
    if (saved) {
      setViewedIds(new Set(JSON.parse(saved)));
    }
    log('info', 'page', 'All Notifications page loaded');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit, page };
      if (type !== 'All') params.notification_type = type;
      
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
      log('info', 'api', `Fetched ${data.notifications?.length || 0} notifications for page ${page}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      log('error', 'api', `Failed to fetch notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, page]);

  const handleView = (id: string) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    log('info', 'component', `Notification ${id} marked as viewed`);
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Latest Feed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with everything on campus
          </Typography>
        </Box>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            label="Type"
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={12}>
          <CircularProgress size={30} thickness={4} />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">No updates found</Typography>
                <Typography variant="body2" color="text.disabled">Try changing your filters</Typography>
              </Box>
            ) : (
              notifications.map((n) => (
                <NotificationCard
                  key={n.ID}
                  id={n.ID}
                  type={n.Type}
                  message={n.Message}
                  timestamp={n.Timestamp}
                  isViewed={viewedIds.has(n.ID)}
                  onView={handleView}
                />
              ))
            )}
          </Box>

          <Box display="flex" justifyContent="center" mb={8}>
            <Pagination 
              count={10} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              color="primary" 
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default AllNotifications;
