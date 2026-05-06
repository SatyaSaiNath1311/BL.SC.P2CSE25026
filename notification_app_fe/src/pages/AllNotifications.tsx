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
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Notifications</Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            label="Filter Type"
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {notifications.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No notifications found.
            </Typography>
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

          <Box display="flex" justifyContent="center" mt={4} mb={6}>
            <Pagination 
              count={10} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default AllNotifications;
