import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import TelegramIcon from '@mui/icons-material/Telegram';
import ViberIcon from '@mui/icons-material/Phone';
import axios from 'axios';

const Footer = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserRole = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsEmployee(false);
          setIsUser(false);
          return;
        }

        setIsAuthenticated(true);

        const [adminResponse, employeeResponse] = await Promise.allSettled([
          axios.get('http://localhost:5000/api/admin/verify-admin', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }),
          axios.get('http://localhost:5000/api/employee/verify-employee', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
        ]);

        if (adminResponse.status === 'fulfilled' && adminResponse.value.data.isAdmin) {
          setIsAdmin(true);
        } else if (employeeResponse.status === 'fulfilled' && employeeResponse.value.data.isEmployee) {
          setIsEmployee(true);
        } else if (adminResponse.status === 'rejected' && adminResponse.reason.response.status === 403 &&
                   employeeResponse.status === 'rejected' && employeeResponse.reason.response.status === 403) {
          setIsUser(true);
        }

      } catch (error) {
        console.error('Ошибка при проверке роли пользователя:', error);
      }
    };

    verifyUserRole();
  }, [navigate]);

  if (isAdmin || isEmployee) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/listings">Недвижимость</a></li>
            <li><a href="/add-listing">Выставить объявление</a></li>
            {isAuthenticated && (
              <>
                <li><a href="/mylistings">Мои объявления</a></li>
                <li><a href="/favorites">Понравившиеся объявления</a></li>
                <li><a href="/chat">Связаться с нами</a></li>
              </>
            )}
          </ul>
        </nav>
        <div className="contact-info">
          <p>г. Дзержинск, ул. Бутлерова, д. 2б</p>
          <p>+7 (8313) 25-92-08</p>
        </div>
        <div className="social-links">
          <a href="https://t.me/eliteocenka" target="_blank" rel="noopener noreferrer">
            <TelegramIcon className="social-icon" />
          </a>
          <a href="viber://chat?number=+78313259208" target="_blank" rel="noopener noreferrer">
            <ViberIcon className="social-icon-viber" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; Элит Оценка {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export default Footer;
