import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { format } from 'date-fns';

interface NotificationCardProps {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  isViewed: boolean;
  score?: number;
  onView: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  message,
  timestamp,
  isViewed,
  score,
  onView,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Placement': return 'primary';
      case 'Result': return 'secondary';
      case 'Event': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card 
      onClick={() => onView(id)}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        borderLeft: isViewed ? 'none' : '5px solid #1976d2',
        backgroundColor: isViewed ? 'inherit' : '#f0f7ff',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          backgroundColor: isViewed ? '#f5f5f5' : '#e3f2fd'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip 
            label={type} 
            color={getTypeColor(type) as any} 
            size="small" 
          />
          <Typography variant="caption" color="text.secondary">
            {timestamp}
          </Typography>
        </Box>
        
        <Typography variant="body1" fontWeight={isViewed ? 'normal' : 'bold'}>
          {message}
        </Typography>

        {score !== undefined && (
          <Box mt={1} display="flex" justifyContent="flex-end">
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              Priority Score: {score}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
