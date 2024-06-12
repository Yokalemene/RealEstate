import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Tabs, Tab, Container, Box, AppBar, Toolbar, Typography, IconButton, Badge, Menu } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ApplicationList from './ApplicationList';
import ChatList from './ChatList';
import NotificationDropdown from './NotificationDropdown';
import './EmployeePanel.css';
import { useNavigate } from 'react-router-dom';

const EmployeePanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0); 
  const [applications, setApplications] = useState({ new: [], inProgress: [], completed: [] });
  const [chats, setChats] = useState({ active: [], completed: [] });
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const fetchIntervalRef = useRef({});

  useEffect(() => {
    const verifyEmployee = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
    
      try {
        const response = await axios.get('http://localhost:5000/api/employee/verify-employee', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        if (!response.data.isEmployee) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        navigate('/login');
      }
    };
    verifyEmployee();  
    
    fetchApplications();
    fetchChats();
    fetchNotifications();

    startFetchIntervals(); // Start the fetch intervals

    return () => {
      clearFetchIntervals(); // Clear intervals when component unmounts
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/applications');
      const categorizedApplications = categorizeApplications(response.data);
      setApplications(categorizedApplications);
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employee/chats');
      const categorizedChats = categorizeChats(response.data);
      setChats(categorizedChats);
    } catch (error) {
      console.error('Ошибка при получении чатов:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Ошибка при получении уведомлений:', error);
    }
  };

  const startFetchIntervals = () => {
    fetchIntervalRef.current.applications = setInterval(fetchApplications, 5000);
    fetchIntervalRef.current.chats = setInterval(fetchChats, 5000);
    fetchIntervalRef.current.notifications = setInterval(fetchNotifications, 5000);
  };

  const clearFetchIntervals = () => {
    clearInterval(fetchIntervalRef.current.applications);
    clearInterval(fetchIntervalRef.current.chats);
    clearInterval(fetchIntervalRef.current.notifications);
  };

  const categorizeApplications = (applications) => {
    const newApplications = [];
    const inProgressApplications = [];
    const completedApplications = [];
    applications.forEach((application) => {
      switch (application.status) {
        case 'Ожидает обработки':
          newApplications.push(application);
          break;
        case 'В работе':
          inProgressApplications.push(application);
          break;
        case 'Завершено':
          completedApplications.push(application);
          break;
        default:
          break;
      }
    });
    return { new: newApplications, inProgress: inProgressApplications, completed: completedApplications };
  };

  const categorizeChats = (chats) => {
    const activeChats = [];
    const completedChats = [];
    chats.forEach((chat) => {
      switch (chat.status) {
        case 'Активный':
          activeChats.push(chat);
          break;
        case 'Завершенный':
          completedChats.push(chat);
          break;
        default:
          break;
      }
    });
    return { active: activeChats, completed: completedChats };
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSubTabValue(0); // Reset sub-tab value when main tab changes
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTabValue(newValue);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`http://localhost:5000/api/employee/notifications/${notificationId}/markAsRead`);
      fetchNotifications();
    } catch (error) {
      console.error('Ошибка при пометке уведомления как прочитанного:', error);
    }
  };

  const handleApplicationClick = (applicationId) => {
    navigate(`/application/${applicationId}`);
  };

  const handleChatClick = (chatId) => {
    console.log('Переход на страницу чата:', chatId);
    navigate(`/chat/${chatId}`);
  };

  const unreadNotifications = notifications.filter(notification => !notification.isRead);

  return (
    <Container className="employee-panel" maxWidth="lg">
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <Typography variant="h6" className="employeePaneltableTitle">
            Панель сотрудника
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={unreadNotifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
          > 
            <NotificationDropdown notifications={unreadNotifications} onMarkAsRead={handleMarkAsRead} />
          </Menu>
        </Toolbar>
      </AppBar>
      <Tabs value={tabValue} onChange={handleTabChange} className="tabs">
        <Tab label="Заявки" className="tab" />
        <Tab label="Чаты" className="tab" />
      </Tabs>
      <Box hidden={tabValue !== 0} className="tab-content">
        <Tabs value={subTabValue} onChange={handleSubTabChange} className="sub-tabs">
          <Tab label="Новые заявки" />
          <Tab label="Заявки в работе" />
          <Tab label="Завершенные заявки" />
        </Tabs>
        <Box hidden={subTabValue !== 0}>
          <ApplicationList applications={applications.new} onApplicationClick={handleApplicationClick} />
        </Box>
        <Box hidden={subTabValue !== 1}>
          <ApplicationList applications={applications.inProgress} onApplicationClick={handleApplicationClick} />
        </Box>
        <Box hidden={subTabValue !== 2}>
          <ApplicationList applications={applications.completed} onApplicationClick={handleApplicationClick} />
        </Box>
      </Box>
      <Box hidden={tabValue !== 1} className="tab-content">
        <Tabs value={subTabValue} onChange={handleSubTabChange} className="sub-tabs">
          <Tab label="Активные чаты" />
          <Tab label="Завершенные чаты" />
        </Tabs>
        <Box hidden={subTabValue !== 0}>
          <ChatList chats={chats.active} onChatClick={handleChatClick} />
        </Box>
        <Box hidden={subTabValue !== 1}>
          <ChatList chats={chats.completed} onChatClick={handleChatClick} />
        </Box>
      </Box>
    </Container>
  );
};

export default EmployeePanel;
