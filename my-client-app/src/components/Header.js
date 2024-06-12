import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BsPersonCircle, BsBoxArrowRight } from 'react-icons/bs';
import './Header.css';
import axios from 'axios';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmployee(false);
    setIsUser(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="nav">
        <ul>
          <li className="logo" id="elit-logo">
            <NavLink exact to="/" activeClassName="active">
              <img src={require('./assets/logo.png')} alt="logo" style={{ maxWidth: '150px', height: 'auto', position: 'absolute', bottom: '0', left: '0' }} />
            </NavLink>
          </li>
          <li>
            <NavLink exact to="/" activeClassName="active">Главная</NavLink>
          </li>
          <li>
            <NavLink to="/listings" activeClassName="active">Недвижимость</NavLink>
          </li>
          {isAuthenticated && isAdmin && (
            <li>
              <NavLink to="/admin" activeClassName="active">Панель администратора</NavLink>
            </li>
          )}
          {isAuthenticated && isEmployee && (
            <li>
              <NavLink to="/employee" activeClassName="active">Панель сотрудника</NavLink>
            </li>
          )}
          {isAuthenticated && isUser && (
            <>
              <li>
                <NavLink to="/add-listing" activeClassName="active">Выставить объявление</NavLink>
              </li>
              <li>
                <NavLink to="/mylistings" activeClassName="active">Мои объявления</NavLink>
              </li>
              <li>
                <NavLink to="/favorites" activeClassName="active">Понравившиеся объявления</NavLink>
              </li>
              <li>
                <NavLink to="/chats" activeClassName="active">Связаться с нами</NavLink>
              </li>
            </>
          )}
          {/* {isAuthenticated && !isUser && (
            <>
              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/admin" activeClassName="active">Панель администратора</NavLink>
                  </li>
                </>
              )}
              {isEmployee && (
                <>
                  <li>
                    <NavLink to="/employee" activeClassName="active">Панель сотрудника</NavLink>
                  </li>
                </>
              )}
            </>
          )} */}
          {!isAuthenticated && (
            <li>
              <NavLink to="/add-listing" activeClassName="active">Выставить объявление</NavLink>
            </li>
          )}
          <li id="personal-account-icon" className="personal-account-icon" onMouseEnter={handleDropdownToggle} onMouseLeave={handleDropdownToggle}>
            <NavLink to="/profile" activeClassName="active">
              <BsPersonCircle />
            </NavLink>
            {isDropdownOpen && (
              <div className="exit-dropdown-menu">
                <button className="header-logout-button" onClick={logout}>
                  <BsBoxArrowRight className="header-logout-icon" />
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
