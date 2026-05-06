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
        cursor: 'pointer',
        borderLeft: isViewed ? '6px solid transparent' : '6px solid #2563eb',
        backgroundColor: isViewed ? 'background.paper' : '#f8faff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 3,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          backgroundColor: isViewed ? '#fdfdfd' : '#f1f5ff'
        }
      }}
    >
      <CardContent sx={{ p: '24px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {!isViewed && (
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)'
                }} 
              />
            )}
            <Chip 
              label={type} 
              color={getTypeColor(type) as any} 
              size="small" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '0.65rem', 
                height: 22,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.02em' }}>
            {timestamp}
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.primary',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
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
