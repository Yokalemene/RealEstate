import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import RealEstatePage from './components/RealEstatePage';
import AddListingPage from './components/AddListingPage';
import ProfilePage from './components/ProfilePage';
//import NewsPage from './components/NewsPage';
import RegPage from "./components/RegistrationPage";
import LoginPage from "./components/LoginPage";
import ListingDetailsPage from './components/ListingDetailsPage';
// import {API_URL} from "./url";
import UserListingsPage from './components/UserListingsPage';
import AdminPanel from './components/AdminPanel';
import EmployeePanel from './components/EmployeePanel';
import ApplicationDetails from './components/ApplicationDetails'
import FavoriteListingsPage from './components/FavoriteListingsPage';
import ClientChat from './components/ClientChat';
import ChatDetail from './components/ChatDetail';
import isTokenExpired from './utilities/checkToken';
import ChangePassword from './components/ChangePassword'; 

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  

 
  return (
    <Router>
      <Header />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/listings" element={<RealEstatePage />} />
        <Route path="/profile" element={<ProfilePage accessToken={accessToken} />} />
        <Route path="/add-listing" element={<AddListingPage accessToken={accessToken} />} />
        <Route path="/registration" element={<RegPage />} />
        <Route path="/login" element={<LoginPage setAccessToken={null} />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/mylistings" element={<UserListingsPage />} />
        <Route path="/admin" element={<AdminPanel/>} />
        <Route path="/employee" element={<EmployeePanel/>} />
        <Route path="/application/:id" element={<ApplicationDetails />} />
        <Route path="/favorites" element={<FavoriteListingsPage />} />
        <Route path="/chats" element={<ClientChat />} />
        <Route path="/chat/:chatId" element={<ChatDetail />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
