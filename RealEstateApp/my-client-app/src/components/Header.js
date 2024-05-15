import React from 'react';
import { NavLink } from 'react-router-dom';
import { BsPersonCircle } from 'react-icons/bs';
import './Header.css';
// import { RiHome2Line } from 'react-icons/ri';

const Header = () => (
    <header className="header">
    <nav className="nav">
      <ul>
      <li className="logo" id="elit-logo">
        <NavLink exact to="/" activeClassName="active">
            <img src={require('./assets/logo.png')} alt="logo" style={{ maxWidth: '150px', height: 'auto', position: 'absolute', bottom: '0',  left: '0'}}/>
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/" activeClassName="active">Главная</NavLink></li>
        <li><NavLink to="/listings" activeClassName="active">Недвижимость</NavLink></li>
        <li><NavLink to="/add-listing" activeClassName="active">Выставить объявление</NavLink></li>
        {/* <li><NavLink to="/news" activeClassName="active">Новости</NavLink></li> */}

        <li id="personal-account-icon" className="personal-account-icon"><NavLink to="/profile" activeClassName="active"><BsPersonCircle /></NavLink></li>
      </ul>
    </nav>
  </header>
);


export default Header;