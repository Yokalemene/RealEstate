import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReportForm from './ReportForm';
import ReportList from './ReportList';
import { Container, Paper, Typography, Select, MenuItem, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel } from '@mui/material';
import './ApplicationDetails.css';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/applications/${id}`);
        setApplication(response.data);
      } catch (error) {
        console.error('Ошибка при получении заявки:', error);
      }
      setTimeout(fetchApplication, 1000);
    };

    fetchApplication();
  }, [id]);

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true);
      await axios.put(`http://localhost:5000/api/employee/applications/${id}/update-status`, { status: newStatus });
      const response = await axios.get(`http://localhost:5000/api/employee/applications/${id}`);
      setApplication(response.data);
      setIsUpdating(false);
    } catch (error) {
      console.error('Ошибка при обновлении статуса заявки:', error);
      setIsUpdating(false);
    }
  };
  
  // Доделать пометку уведомления как прочитанного
  // const handleMarkAsRead = async (notificationId) => {
  //   try {
  //     await axios.post(`http://localhost:5000/api/employee/notifications/${notificationId}/markAsRead`);
  //     fetchNotifications();
  //   } catch (error) {
  //     console.error('Ошибка при пометке уведомления как прочитанного:', error);
  //   }
  // };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  if (!application) {
    return <div>Загрузка...</div>;
  }

  const statusColors = {
    'Ожидает обработки': '#2196f3',
    'В работе': '#ff9800',
    'Завершено': '#4caf50',
    'Отклонено': '#f44336'
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Заявка #{application._id}</Typography>
        <Typography>Дата создания: {new Date(application.createdAt).toLocaleDateString()}</Typography>
        <Typography style={{ color: statusColors[application.status] }}>Статус: {application.status}</Typography>
        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Изменить статус</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <MenuItem value="">Выберите новый статус</MenuItem>
              <MenuItem value="Ожидает обработки">Ожидает обработки</MenuItem>
              <MenuItem value="В работе">В работе</MenuItem>
              <MenuItem value="Завершено">Завершено</MenuItem>
              <MenuItem value="Отклонено">Отклонено</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={handleStatusChange} variant="contained" color="primary" disabled={!newStatus || isUpdating} sx={{ mt: 2 }}>
            Изменить статус
          </Button>
        </Box>
        <Button onClick={() => navigate(`/listings/${application.listingId}`)} variant="contained" color="secondary" sx={{ mt: 3 }}>
          Перейти к объявлению
        </Button>
        <Button onClick={openModal} variant="contained" color="secondary" sx={{ mt: 3, ml: 2 }}>Сформировать отчет</Button>
      </Paper>

      <Dialog open={showModal} onClose={closeModal}>
        <DialogTitle>Сформировать отчет</DialogTitle>
        <DialogContent>
          <ReportForm applicationId={id} onSubmit={closeModal} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">Закрыть</Button>
        </DialogActions>
      </Dialog>

      <ReportList applicationId={id} />
    </Container>
  );
};

export default ApplicationDetails;
