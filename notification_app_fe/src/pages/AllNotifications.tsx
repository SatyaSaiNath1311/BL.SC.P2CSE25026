import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Select, MenuItem, FormControl, 
  InputLabel, Pagination, CircularProgress, Alert 
} from '@mui/material';
import { getNotifications } from '../api/client';
import NotificationCard from '../components/NotificationCard';
import { Log } from '../logging_middleware/logger.fe';

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
    Log('frontend', 'info', 'page', 'All Notifications page loaded');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit, page };
      if (type !== 'All') params.notification_type = type;
      
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
      Log('frontend', 'info', 'api', `Fetched ${data.notifications?.length || 0} notifications for page ${page}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      Log('frontend', 'error', 'api', `Failed to fetch notifications: ${msg}`);
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
    Log('frontend', 'info', 'component', `Notification ${id} marked as viewed`);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 8, mt: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Latest Feed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Stay updated with everything on campus
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="type-filter-label">Filter by Category</InputLabel>
            <Select
              labelId="type-filter-label"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              label="Filter by Category"
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
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

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
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
