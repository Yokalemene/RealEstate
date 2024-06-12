import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, MenuItem, Typography, IconButton, Tooltip, Checkbox, FormControlLabel } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import './RealEstatePage.css';
import Autocomplete from '@mui/material/Autocomplete';
import InfiniteScroll from 'react-infinite-scroll-component';

const RealEstatePage = () => {
  const [listings, setListings] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    propertyType: '',
    location: '',
    priceFrom: '',
    priceTo: '',
    hasReport: false
  });
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [likedListings, setLikedListings] = useState([]);
  
  useEffect(() => {
    fetchListings();
    fetchUniqueLocations();
    fetchLikedListings();
  }, []);

  const fetchListings = async (page = 1) => {
    try {
      const { propertyType, location, priceFrom, priceTo, hasReport } = searchCriteria;
      const response = await axios.get('http://localhost:5000/api/listings', {
        params: {
          propertyType,
          location,
          priceFrom,
          priceTo,
          hasReport,
          page
        }
      });
      const fetchedListings = response.data;
      setListings((prevListings) => [...prevListings, ...fetchedListings]);
      setHasMore(fetchedListings.length > 0);
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    }
  };

  const fetchUniqueLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/listings/unique-locations');
      setUniqueLocations(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уникальных местоположений:', error);
    }
  };

  const fetchLikedListings = async () => {
    try {
      const likedResponse = await axios.get('http://localhost:5000/api/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setLikedListings(likedResponse.data.map(listing => listing._id));
    } catch (error) {
      console.error('Ошибка загрузки понравившихся объявлений:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setListings([]);
    setPage(1);
    fetchListings(1);
  };

  const openListing = (id) => {
    navigate(`/listings/${id}`);
  };

  const handleLike = async (listingId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(`http://localhost:5000/api/listings/${listingId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const isLiked = response.data.liked;
      setLikedListings((prevLikedListings) => {
        if (isLiked) {
          return [...prevLikedListings, listingId];
        } else {
          return prevLikedListings.filter(id => id !== listingId);
        }
      });
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
    }
  };

  const handleMouseEnter = async (listingId, setShowRating) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${listingId}`);
      if (response.data.length > 0) {
        const latestReport = response.data[0];
        setShowRating(latestReport.rating);
      }
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    }
  };

  const loadMoreListings = () => {
    setPage((prevPage) => {
      fetchListings(prevPage + 1);
      return prevPage + 1;
    });
  };

  const handleResetFilters = () => {
    setSearchCriteria({
      propertyType: '',
      location: '',
      priceFrom: '',
      priceTo: '',
      hasReport: false
    });
    setListings([]);
    setPage(1);
    fetchListings(1);
  };

  return (
    <div style={{ padding: '0 20px', marginBottom: '100px' }}>
      <h2>Поиск недвижимости</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Выберите тип недвижимости"
              value={searchCriteria.propertyType}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, propertyType: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Любой</MenuItem>
              <MenuItem value="Квартира">Квартира</MenuItem>
              <MenuItem value="Комната">Комната</MenuItem>
              <MenuItem value="Дом, дача, коттедж">Дом, дача, коттедж</MenuItem>
              <MenuItem value="Земельный участок">Земельный участок</MenuItem>
              <MenuItem value="Гараж и машиноместо">Гараж и машиноместо</MenuItem>
              <MenuItem value="Другое">Другое</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={uniqueLocations}
              value={searchCriteria.location}
              onChange={(event, newValue) => setSearchCriteria({ ...searchCriteria, location: newValue })}
              renderInput={(params) => <TextField {...params} label="Введите местоположение" fullWidth />}
              noOptionsText={"Ничего не найдено"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Цена от"
              value={searchCriteria.priceFrom}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, priceFrom: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Цена до"
              value={searchCriteria.priceTo}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, priceTo: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchCriteria.hasReport}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, hasReport: e.target.checked })}
                />
              }
              label="Только с отчетами"
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Применить фильтры
            </Button>
            <Button type="filter-refresh-button" variant="outlined" onClick={handleResetFilters} style={{ marginLeft: '10px' }}>
              Сбросить фильтры поиска
            </Button>
          </Grid>
        </Grid>
      </form>
      <InfiniteScroll
        dataLength={listings.length}
        next={loadMoreListings}
        hasMore={hasMore}
        loader={<Typography variant="body1">Загрузка...</Typography>}
        endMessage={<Typography variant="body1">Вы достигли конца списка.</Typography>}
      >
        <div className="listings-container">
          {listings.length > 0 ? (
            listings.map(listing => (
              <div
                key={listing._id}
                className="listing"
                onClick={() => openListing(listing._id)}
                onMouseEnter={(e) => handleMouseEnter(listing._id, e.currentTarget.querySelector('.rating'))}
              >
                <img src={listing.photos[0]} alt="Photo" />
                <div className="like-button">
                  <Tooltip title={likedListings.includes(listing._id) ? "Удалить из избранного" : "Добавить в избранное"}>
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); handleLike(listing._id); }}
                      color="secondary"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                    >
                      {likedListings.includes(listing._id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="listing-info">
                  <Typography variant="h6">{listing.propertyType}</Typography>
                  <Typography>{listing.location}</Typography>
                  <Typography>{listing.price} &#8381;</Typography>
                </div>
                <div className="rating"></div>
              </div>
            ))
          ) : (
            <Typography variant="body1">Нет доступных объявлений</Typography>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default RealEstatePage;
