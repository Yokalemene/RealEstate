import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import './ReportList.css';

const ReportList = ({ applicationId }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/application/${applicationId}`);
        setReports(response.data);
      } catch (error) {
        console.error('Ошибка при получении отчетов:', error);
      }
    };

    fetchReports();
  }, [applicationId]);

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`http://localhost:5000/api/employee/delete-report/${reportId}`);
      setReports(reports.filter(report => report._id !== reportId));
      alert('Отчет успешно удален!');
    } catch (error) {
      console.error('Ошибка при удалении отчета:', error);
      alert('Произошла ошибка при удалении отчета');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Отчеты</Typography>
        {reports.length > 0 ? (
          <List>
            {reports.map(report => (
              <ListItem key={report._id} divider>
                <ListItemText
                  primary={`ФИО собственника: ${report.clientName}`}
                  secondary={
                    <>
                      <Typography>Тип недвижимости: {report.propertyType}</Typography>
                      <Typography>Местоположение: {report.location}</Typography>
                      <Typography>Цена: {report.price}</Typography>
                      <Typography>Спальни: {report.bedrooms}</Typography>
                      <Typography>Ванные: {report.bathrooms}</Typography>
                      <Typography>Площадь: {report.area}</Typography>
                      <Typography>Описание: {report.description}</Typography>
                      <Typography>Общий балл недвижимости: {report.rating}</Typography>
                      <Typography>Дата формирования отчета: {new Date(report.createdAt).toLocaleDateString()}</Typography>
                    </>
                  }
                />
                <Button onClick={() => handleDeleteReport(report._id)} variant="contained" color="secondary">
                  Удалить отчет
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет отчетов</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ReportList;
