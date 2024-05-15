import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/listings">Недвижимость</a></li>
            
          </ul>
          <ul>
          <li><a href="/add-listing">Выставить объявление</a></li>
          <li><a href="/profile">Личный кабинет</a></li>
           

          </ul>
          <ul>
          {/* <li><a href="/news">Новости</a></li> */}
          </ul>
        </nav>
        <p>&copy; ЭлитО {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export default Footer;