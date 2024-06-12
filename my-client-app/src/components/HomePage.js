import React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as HouseIcon } from './assets/house.svg';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item xs={12} md={6} className="home-content">
          <Typography variant="h2" component="h1" gutterBottom className="title">
            Добро пожаловать в наше веб-приложение для агентства недвижимости!
          </Typography>
          <Typography variant="body1" gutterBottom className="description">
            Мы предлагаем широкий спектр услуг по поиску, продаже, аренде и оценке недвижимости.
            Наше веб-приложение поможет вам найти идеальное жилье по вашим критериям, а также получить надежную оценку вашего имущества.
          </Typography>
          <Grid container spacing={2}> {/* Добавляем контейнер для кнопок с отступом */}
            <Grid item> {/* Добавляем элемент для кнопки "Исследовать недвижимость" */}
              <Button variant="contained" component={Link} to="/listings" className="explore-button">
                Исследовать недвижимость
              </Button>
            </Grid>
            <Grid item> {/* Добавляем элемент для кнопки "Зарегистрироваться" */}
              <Button variant="contained" component={Link} to="/registration" className="register-button">
                Зарегистрироваться
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6} className="home-image">
          <HouseIcon className="house-icon" />
        </Grid>
      </Grid>
      <div className="about-section">
        <Typography variant="h3" component="h2" gutterBottom className="about-title">
          О нашей компании
        </Typography>
        <Typography variant="body1" gutterBottom className="about-description">
          Наша компания предоставляет профессиональные услуги по оценке недвижимости с большим опытом работы на рынке.
          Мы работаем с клиентами по всей стране и обеспечиваем надежные и точные оценки для различных типов недвижимости.
        </Typography>
      </div>
    </div>
  );
}

export default HomePage;
