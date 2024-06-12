import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { IconButton, Container, Box, Typography, Paper, Grid, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import 'react-image-gallery/styles/css/image-gallery.css';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reports, setReports] = useState([]);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const [liked, setLiked] = useState(false);
  const [openReportsDialog, setOpenReportsDialog] = useState(false);
  const [views, setViews] = useState({ totalViews: 0, todayViews: 0 });

  const checkIfLiked = async (listingId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:5000/api/listings/${listingId}/liked`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.liked;
    } catch (error) {
      console.error('Ошибка при проверке лайка:', error);
      return false; // В случае ошибки вернуть false
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(response.data);
        // Проверка, находится ли объявление в избранном у пользователя
        const isLiked = await checkIfLiked(id); 
        setLiked(isLiked);
      } catch (error) {
        console.error('Ошибка загрузки объявления:', error);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reports/${id}`);
        setReports(response.data);
      } catch (error) {
        console.error('Ошибка загрузки отчетов:', error);
      }
      setTimeout(fetchReports, 10000);
    };

    fetchReports();
  }, [id]);

  useEffect(() => {
    const logView = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        await axios.post(`http://localhost:5000/api/views/${id}/log`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (error) {
        console.error('Ошибка при записи просмотра:', error);
      }
    };

    const fetchViews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/views/${id}/check`);
        setViews(response.data);
      } catch (error) {
        console.error('Ошибка при получении просмотров:', error);
      }
    };

    logView();
    fetchViews();
  }, [id]);

  const handleLike = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(`http://localhost:5000/api/listings/${id}/like`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }});
      // Обновление состояния лайка на основе ответа от сервера
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
    }
  };

  const handleOpenReportsDialog = () => {
    setOpenReportsDialog(true);
  };

  const handleCloseReportsDialog = () => {
    setOpenReportsDialog(false);
  };

  const handleImageClick = (event) => {
    setFullscreenPhoto(event.target.src);
  };

  if (!listing) {
    return <p>Загрузка...</p>;
  }

  const images = listing.photos.map(photo => ({
    original: photo,
    thumbnail: photo,
  }));

  return (
    <Container className="container">
      <Paper elevation={3} className="paper">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <ImageGallery
              items={images}
              onClick={handleImageClick}
              showPlayButton={false}
              disableSwipe={false}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" className="heading">{listing.propertyType}</Typography>
              <Tooltip title={liked ? "Удалить из избранного" : "Добавить в избранное"}>
                <IconButton onClick={handleLike} color="secondary">
                  {liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="property-info">
              <FiMapPin className="icon" />
              <Typography variant="body1" className="label">Местоположение:</Typography>&nbsp;{listing.location}
            </Box>
            <Box className="property-info">
              <Typography variant="body1" className="label">Цена:</Typography>&nbsp;{listing.price} &#8381;
            </Box>
            <Typography variant="body1" className="description">
              <span className="label">Описание:</span> {listing.description}
            </Typography>
            <Box className="property-info">
              <FiPhone className="icon" />
              <Typography variant="body1" className="label">Контактная информация:</Typography>&nbsp;{listing.contactInfo}
            </Box>
            <Button variant="contained" color="primary" onClick={handleOpenReportsDialog} sx={{ mt: 2 }}>
              Посмотреть отчеты
            </Button>
            <Box className="property-info">
              <Typography variant="body1" className="label">Просмотры сегодня:</Typography>&nbsp;{views.todayViews}
            </Box>
            <Box className="property-info">
              <Typography variant="body1" className="label">Всего просмотров:</Typography>&nbsp;{views.totalViews}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={openReportsDialog} onClose={handleCloseReportsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Отчеты</DialogTitle>
        <DialogContent dividers>
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <Box key={index} className="report-box">
                <Typography variant="h6">{report.clientName}</Typography>
                <Typography>Тип недвижимости: {report.propertyType}</Typography>
                <Typography>Местоположение: {report.location}</Typography>
                <Typography>Цена: {report.price} &#8381;</Typography>
                <Typography>Количество спален: {report.bedrooms}</Typography>
                <Typography>Количество ванных комнат: {report.bathrooms}</Typography>
                <Typography>Площадь: {report.area} м²</Typography>
                <Typography>Описание: {report.description}</Typography>
                <Typography>Рейтинг: {report.rating}</Typography>
              </Box>
            ))
          ) : (
            <Typography>Отчеты отсутствуют</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportsDialog} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      {fullscreenPhoto && (
        <div className="fullscreen-photo" onClick={() => setFullscreenPhoto(null)}>
          <img src={fullscreenPhoto} alt="Fullscreen" />
        </div>
      )}
    </Container>
  );
};

export default ListingDetailsPage;