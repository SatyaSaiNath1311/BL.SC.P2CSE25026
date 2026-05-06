import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, CircularProgress, Alert, 
  Slider, Divider, Stack
} from '@mui/material';
import { getNotifications } from '../api/client';
import NotificationCard from '../components/NotificationCard';
import { getPriorityNotifications } from '../utils/priority';
import { log } from '../utils/logger';

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
    log('info', 'page', 'Priority Inbox page loaded');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch a larger batch to calculate priority across more items
      const data = await getNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
      log('info', 'api', 'Fetched batch for priority calculation');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      log('error', 'api', `Failed to fetch priority batch: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    log('info', 'component', `Priority notification ${id} marked as viewed`);
  };

  const priorityList = getPriorityNotifications(notifications, limit);

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Priority Inbox</Typography>
        <Typography variant="body2" color="text.secondary">
          Notifications ranked by relevance: Placement (3x) &gt; Result (2x) &gt; Event (1x) plus recency.
        </Typography>
      </Box>

      <Box sx={{ px: 2, mb: 4, py: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
        <Typography gutterBottom variant="subtitle2">Show Top {limit} Notifications</Typography>
        <Slider
          value={limit}
          min={1}
          max={20}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={(_, v) => setLimit(v as number)}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {priorityList.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No notifications to rank.
            </Typography>
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
      <Box mb={6} />
    </Container>
  );
};

export default PriorityInbox;
