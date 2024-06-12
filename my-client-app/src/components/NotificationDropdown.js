import React, { useState } from 'react';
import { List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ notifications, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [hoveredNotification, setHoveredNotification] = useState(null);

  const handleNotificationClick = (notification) => {
    if (notification.message) {
      const regex = /ID: ([a-zA-Z0-9]+)/;
      const match = notification.message.match(regex);
      if (match && match[1]) {
        const applicationId = match[1];
        const applicationUrl = `/application/${applicationId}`;
        navigate(applicationUrl);
        onMarkAsRead(notification._id);
      }
    }
  };

  return (
    <List>
      {Array.isArray(notifications) && notifications.length > 0 ? (
        notifications.map((notification) => (
          <React.Fragment key={notification._id}>
            <ListItem
              onMouseEnter={() => setHoveredNotification(notification._id)}
              onMouseLeave={() => setHoveredNotification(null)}
              onClick={() => handleNotificationClick(notification)}
              style={{ backgroundColor: hoveredNotification === notification._id ? '#f0f0f0' : 'transparent', cursor: 'default' }}
            >
              <ListItemText primary={`ID: ${notification._id}`} secondary={notification.message} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))
      ) : (
        <ListItem>
          <Typography variant="body2">Нет новых уведомлений</Typography>
        </ListItem>
      )}
    </List>
  );
};

export default NotificationDropdown;
