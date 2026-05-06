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
        borderLeft: isViewed ? '4px solid transparent' : '4px solid #2563eb',
        backgroundColor: isViewed ? 'background.paper' : '#f8faff',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          backgroundColor: isViewed ? '#fcfcfc' : '#f0f7ff'
        }
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={type} 
              color={getTypeColor(type) as any} 
              size="small" 
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
            {!isViewed && (
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#2563eb' 
                }} 
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {timestamp}
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.primary',
            fontSize: '1rem',
            lineHeight: 1.6,
            fontWeight: isViewed ? 400 : 600 
          }}
        >
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
