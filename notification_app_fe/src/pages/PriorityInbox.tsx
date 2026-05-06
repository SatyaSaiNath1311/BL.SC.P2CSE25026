import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, CircularProgress, Alert, 
  Slider, Stack
} from '@mui/material';
import { getNotifications } from '../api/client';
import NotificationCard from '../components/NotificationCard';
import { getPriorityNotifications } from '../utils/priority';
import { Log } from '../logging_middleware/logger';

const PriorityInbox: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('viewed_notifications');
    if (saved) {
      setViewedIds(new Set(JSON.parse(saved)));
    }
    Log('frontend', 'info', 'page', 'Priority Inbox page loaded');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      Log('frontend', 'info', 'api', 'Fetched batch for priority calculation');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      Log('frontend', 'error', 'api', `Failed to fetch priority batch: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    Log('frontend', 'info', 'component', `Notification ${id} marked as viewed`);
  };

  const priorityList = getPriorityNotifications(notifications, limit);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 7 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Priority Inbox</Typography>
        <Typography variant="body2" color="text.secondary">
          Smart ranking based on category importance and time.
        </Typography>
      </Box>

      <Box sx={{ p: 3, mb: 5, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography gutterBottom variant="subtitle2" sx={{ mb: 2, display: 'block' }}>
          Showing top <strong>{limit}</strong> priority items
        </Typography>
        <Slider
          value={limit}
          min={1}
          max={20}
          step={1}
          valueLabelDisplay="auto"
          onChange={(_, v) => setLimit(v as number)}
          sx={{ color: 'primary.main' }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress size={30} thickness={4} />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ mb: 8 }}>
          {priorityList.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">Empty inbox</Typography>
              <Typography variant="body2" color="text.disabled">No high-priority items at the moment</Typography>
            </Box>
          ) : (
            priorityList.map((n: any) => (
              <NotificationCard
                key={n.ID}
                id={n.ID}
                type={n.Type}
                message={n.Message}
                timestamp={n.Timestamp}
                isViewed={viewedIds.has(n.ID)}
                score={n.score}
                onView={handleView}
              />
            ))
          )}
        </Stack>
      )}
    </Container>
  );
};

export default PriorityInbox;
