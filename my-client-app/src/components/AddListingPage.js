import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';
import './AddListingPage.css'; // Файл стилей для формы

const AddListingPage = () => {
  const [listingData, setListingData] = useState({
    propertyType: '',
    location: '',
    price: '',
    description: '',
    contactInfo: ''
  });
  const [photos, setPhotos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          window.location.href = '/login';
          return;
      }
        const response = await axios.get('http://localhost:5000/api/getuserphone', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setUserPhoneNumber(response.data.phoneNumber);
      } catch (error) {
        console.error('Ошибка при получении данных о текущем пользователе:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleAddListing = async (e) => {
    e.preventDefault();
  
    if (!listingData.propertyType || !listingData.location || !listingData.price || !listingData.description || !listingData.contactInfo || photos.length === 0) {
      setErrorMessage('Пожалуйста, заполните все поля и загрузите фотографии.');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('propertyType', listingData.propertyType);
      formData.append('location', listingData.location);
      formData.append('price', listingData.price);
      formData.append('description', listingData.description);
      formData.append('contactInfo', listingData.contactInfo);
      photos.forEach(photo => formData.append('photos', photo));

      const response = await axios.post('http://localhost:5000/api/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`
        }
      });
      setSuccessMessage(response.data.message);
      setListingData({
        propertyType: '',
        location: '',
        price: '',
        description: '',
        contactInfo: ''
      });
      setPhotos([]);
    } catch (error) {
      setErrorMessage('Ошибка при добавлении объявления. Пожалуйста, попробуйте снова.');
      console.error('Ошибка при добавлении объявления:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const selectedPhotos = Array.from(e.target.files);
    setPhotos(selectedPhotos);
  };

  const handlePriceChange = (e) => {
    // Удаляем все символы, кроме цифр
    const price = e.target.value.replace(/\D/g, '');
    setListingData({ ...listingData, price: price });
  };


  return (
    <div className="add-listing-form-container">
      <h2 className="form-title">Добавить объявление</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleAddListing} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="propertyType">Тип недвижимости:</label>
          <select
            id="propertyType"
            className="form-control"
            value={listingData.propertyType}
            onChange={(e) => setListingData({ ...listingData, propertyType: e.target.value })}
          >
            <option value="">Выберите тип недвижимости</option>
            <option value="Квартира">Квартира</option>
            <option value="Комната">Комната</option>
            <option value="Дом, дача, коттедж">Дом, дача, коттедж</option>
            <option value="Земельный участок">Земельный участок</option>
            <option value="Гараж и машиноместо">Гараж и машиноместо</option>
            <option value="Другое">Другое</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="location">Местоположение:</label>
          <input
            type="text"
            id="location"
            className="form-control"
            value={listingData.location}
            onChange={(e) => setListingData({ ...listingData, location: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Цена:</label>
          <input
            type="text"
            id="price"
            className="form-control"
            value={listingData.price}
            onChange={handlePriceChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" >Описание:</label>
          <textarea 
            id="description"
            className="form-control"
            value={listingData.description}
            onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
            style={{ height: "200px", resize: "none" }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactInfo">Контактная информация:</label>
          <InputMask
            mask="+7 (999)-999-99-99"
            maskChar="_"
            id="contactInfo"
            className="form-control"
            value={listingData.contactInfo || userPhoneNumber} // Используем номер телефона пользователя
            onChange={(e) => setListingData({ ...listingData, contactInfo: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="photos">Выберите фотографии:</label>
          <input
            type="file"
            id="photos"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Добавить объявление</button>
      </form>
    </div>
  );
}

export default AddListingPage;