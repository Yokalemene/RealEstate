import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';
import { BsEnvelopeFill, BsPersonFill, BsFileEarmarkTextFill, BsList, BsClockHistory, BsPencil, BsCheck, BsX, BsArrowUp, BsArrowDown, BsFileTextFill } from 'react-icons/bs';
import { FaClipboardUser } from "react-icons/fa6";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [navMenuActive, setNavMenuActive] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [editReportId, setEditReportId] = useState(null);
  const [editReportData, setEditReportData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [employees, setEmployees] = useState([]);
  const [newEmployeeData, setNewEmployeeData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editEmployeeData, setEditEmployeeData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [usersResponse, listingsResponse, applicationsResponse, activityLogsResponse, reportsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users'),
          axios.get('http://localhost:5000/api/admin/listings'),
          axios.get('http://localhost:5000/api/admin/applications'),
          axios.get('http://localhost:5000/api/admin/activitylog'),
          axios.get('http://localhost:5000/api/admin/reports')
        ]);

        if (isMounted) {
          setUsers(usersResponse.data);
          setListings(listingsResponse.data);
          setApplications(applicationsResponse.data);
          setActivityLogs(activityLogsResponse.data);
          setReports(reportsResponse.data);
        }

        if (isMounted) {
          setTimeout(fetchData, 1000);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Ошибка загрузки данных:', error);
        }
      }
    };

    const verifyAdmin = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/admin/verify-admin', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.isAdmin) {
          fetchData();
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        navigate('/login');
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const filterData = () => {
      let filtered = [];
      const searchLower = searchInput.toLowerCase();
      const filterFn = (item) =>
        Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(searchLower));

      switch (activeTab) {
        case 'users':
          filtered = users.filter(filterFn);
          break;
        case 'listings':
          filtered = listings.filter(filterFn);
          break;
        case 'applications':
          filtered = applications.filter(filterFn);
          break;
        case 'activitylog':
          filtered = activityLogs.filter(filterFn);
          break;
        case 'reports':
          filtered = reports.filter(filterFn);
          break;
        case 'employees':
          filtered = employees.filter(filterFn);
          break;
        default:
          break;
      }
      setFilteredData(filtered);
    };

    filterData();
  }, [activeTab, searchInput, users, listings, applications, activityLogs, reports, employees]);

  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/employees');
        if (isMounted) {
          setEmployees(response.data);
        }

        if (isMounted && activeTab === 'employees') {
          setTimeout(fetchEmployees, 1000);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Ошибка загрузки данных о сотрудниках:', error);
        }
      }
    };

    if (activeTab === 'employees') {
      fetchEmployees();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleCreateEmployee = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/employees', newEmployeeData);
      setEmployees([...employees, { ...response.data, role: newEmployeeData.role }]);
      setNewEmployeeData({ username: '', email: '', password: '', role: '' });
    } catch (error) {
      console.error('Ошибка при создании сотрудника:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput('');
  };

  const handleNavMenuToggle = () => {
    setNavMenuActive(!navMenuActive);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployeeData({ ...newEmployeeData, [name]: value });
  };

  const handleRoleChange = (e) => {
    setNewEmployeeData({ ...newEmployeeData, role: e.target.value });
  };

  const handleApproveListing = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/listings/${id}/approve`);
      const response = await axios.get('http://localhost:5000/api/admin/listings');
      setListings(response.data);
    } catch (error) {
      console.error('Ошибка одобрения объявления:', error);
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/listings/delete/${id}`);
      setListings(listings.filter(listing => listing._id !== id));
    } catch (error) {
      console.error('Ошибка удаления объявления:', error);
    }
  };

  const handleApproveApplication = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/applications/${id}/approve`);
      const response = await axios.get('http://localhost:5000/api/admin/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Ошибка одобрения заявки:', error);
    }
  };

  const handleCancelApplication = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/applications/${id}/cancel`);
      const response = await axios.get('http://localhost:5000/api/admin/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Ошибка отмены заявки:', error);
    }
  };

  const handleCompleteApplication = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/applications/${id}/complete`);
      const response = await axios.get('http://localhost:5000/api/admin/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Ошибка завершения заявки:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user._id);
    setEditUserData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUserData({ ...editUserData, [name]: value });
  };

  const handleSaveUser = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${editUserId}`, editUserData);
      setUsers(users.map(user => user._id === editUserId ? editUserData : user));
      setEditUserId(null);
      alert('Пользователь успешно отредактирован');
    } catch (error) {
      console.error('Ошибка при редактировании пользователя:', error);
      alert('Ошибка при редактировании пользователя');
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      alert('Пользователь успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  const handleEditReport = (report) => {
    setEditReportId(report._id);
    setEditReportData(report);
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setEditReportData({ ...editReportData, [name]: value });
  };

  const handleSaveReport = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/reports/${editReportId}`, editReportData);
      setReports(reports.map(report => report._id === editReportId ? editReportData : report));
      setEditReportId(null);
      alert('Отчет успешно отредактирован');
    } catch (error) {
      console.error('Ошибка при редактировании отчета:', error);
      alert('Ошибка при редактировании отчета');
    }
  };

  const handleCancelEditReport = () => {
    setEditReportId(null);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/reports/${reportId}`);
      setReports(reports.filter(report => report._id !== reportId));
      alert('Отчет успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении отчета:', error);
      alert('Ошибка при удалении отчета');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        key = null;
        direction = 'asc';
      }
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <BsArrowUp /> : (sortConfig.direction === 'desc' ? <BsArrowDown /> : null);
    }
    return null;
  };

  const handleEditEmployee = (employee) => {
    setEditEmployeeId(employee._id);
    setEditEmployeeData({
      username: employee.username,
      email: employee.email,
      role: employee.role
    });
  };
  
  const handleChangeEmployee = (e) => {
    const { name, value } = e.target;
    setEditEmployeeData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSaveEmployee = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/employees/${editEmployeeId}`, editEmployeeData);
      setEmployees(employees.map(employee => employee._id === editEmployeeId ? response.data : employee));
      setEditEmployeeId(null);
      alert('Сотрудник успешно отредактирован');
    } catch (error) {
      console.error('Ошибка при редактировании сотрудника:', error);
      alert('Ошибка при редактировании сотрудника');
    }
  };
  
  const handleCancelEditEmployee = () => {
    setEditEmployeeId(null);
    setEditEmployeeData({});
  };
  
  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/employees/${employeeId}`);
      setEmployees(employees.filter(employee => employee._id !== employeeId));
      alert('Сотрудник успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      alert('Ошибка при удалении сотрудника');
    }
  };


  return (
    <div className={`admin-panel ${navMenuActive ? '' : 'collapsed'}`}>
      <div className="nav-menu">
        <div className="nav-menu-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={handleNavMenuToggle}>
          {navMenuActive ? 'Навигация' : <BsList />}
        </div>
        <div className="nav-menu-content">
          <ul>
            <li
              className={`nav-menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              {navMenuActive ? 'Пользователи' : <BsPersonFill />}
            </li>
            <li
              className={`nav-menu-item ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => handleTabChange('listings')}
            >
              {navMenuActive ? 'Объявления' : <BsFileEarmarkTextFill />}
            </li>
            <li
              className={`nav-menu-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => handleTabChange('applications')}
            >
              {navMenuActive ? 'Заявки' : <BsEnvelopeFill />}
            </li>
            <li
              className={`nav-menu-item ${activeTab === 'activitylog' ? 'active' : ''}`}
              onClick={() => handleTabChange('activitylog')}
            >
              {navMenuActive ? 'Журнал действий' : <BsClockHistory />}
            </li>
            <li
              className={`nav-menu-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              {navMenuActive ? 'Отчеты' : <BsFileTextFill />}
            </li>
            <li
              className={`nav-menu-item ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTabChange('employees')}
            >
              {navMenuActive ? 'Сотрудники' : <FaClipboardUser/>}
            </li>
          </ul>
        </div>
      </div>
      <div className="main-content">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск..."
          className="search-input"
        />
        {activeTab === 'users' && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')}>ID пользователя {renderSortIndicator('_id')}</th>
                <th onClick={() => handleSort('lastName')}>Отчество {renderSortIndicator('lastName')}</th>
                <th onClick={() => handleSort('firstName')}>Имя {renderSortIndicator('firstName')}</th>
                <th onClick={() => handleSort('middleName')}>Фамилия {renderSortIndicator('middleName')}</th>
                <th onClick={() => handleSort('email')}>Email {renderSortIndicator('email')}</th>
                <th onClick={() => handleSort('phoneNumber')}>Телефон {renderSortIndicator('phoneNumber')}</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedData(filteredData).map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editUserData.lastName}
                        onChange={handleChange}
                      />
                    ) : (
                      user.lastName
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editUserData.firstName}
                        onChange={handleChange}
                      />
                    ) : (
                      user.firstName
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        name="middleName"
                        value={editUserData.middleName}
                        onChange={handleChange}
                      />
                    ) : (
                      user.middleName
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        name="email"
                        value={editUserData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editUserData.phoneNumber}
                        onChange={handleChange}
                      />
                    ) : (
                      user.phoneNumber
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <div>
                        <button onClick={handleSaveUser} className="action-button confirm">
                          <BsCheck />
                        </button>
                        <button onClick={handleCancelEdit} className="action-button cancel">
                          <BsX />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => handleEditUser(user)} className="action-button edit">
                          <BsPencil />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="action-button delete">
                          <BsX />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'listings' && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')}>ID объявления {renderSortIndicator('_id')}</th>
                <th onClick={() => handleSort('propertyType')}>Тип собственности {renderSortIndicator('propertyType')}</th>
                <th onClick={() => handleSort('location')}>Местоположение {renderSortIndicator('location')}</th>
                <th onClick={() => handleSort('price')}>Цена {renderSortIndicator('price')}</th>
                <th onClick={() => handleSort('description')}>Описание {renderSortIndicator('description')}</th>
                <th onClick={() => handleSort('contactInfo')}>Контактная информация {renderSortIndicator('contactInfo')}</th>
                <th onClick={() => handleSort('createdAt')}>Дата добавления {renderSortIndicator('createdAt')}</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedData(filteredData).map(listing => (
                <tr key={listing._id}>
                  <td>{listing._id}</td>
                  <td>{listing.propertyType}</td>
                  <td>{listing.location}</td>
                  <td>{listing.price}</td>
                  <td>{listing.description}</td>
                  <td>{listing.contactInfo}</td>
                  <td>{listing.createdAt}</td>
                  <td>
                    {/* {listing.isApproved ? (
                      <button disabled className="action-button approved">Одобрено</button>
                    ) : (
                      <button onClick={() => handleApproveListing(listing._id)} className="action-button approve">Одобрить</button>
                    )} */}
                    <button onClick={() => handleDeleteListing(listing._id)} className="action-button delete">
                      <BsX />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'applications' && (
          <div>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('_id')}>ID заявки {renderSortIndicator('_id')}</th>
                  <th onClick={() => handleSort('listingId')}>ID объявления {renderSortIndicator('listingId')}</th>
                  <th onClick={() => handleSort('userId')}>ID пользователя {renderSortIndicator('userId')}</th>
                  <th onClick={() => handleSort('status')}>Статус {renderSortIndicator('status')}</th>
                  <th onClick={() => handleSort('createdAt')}>Дата подачи {renderSortIndicator('createdAt')}</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {sortedData(filteredData).map(application => (
                  <tr key={application._id}>
                    <td>{application._id}</td>
                    <td>{application.listingId}</td>
                    <td>{typeof application.userId === 'object' ? application.userId.email : application.userId}</td>
                    <td>{application.status}</td>
                    <td>{application.createdAt}</td>
                    <td>
                      <button onClick={() => handleApproveApplication(application._id)} className="action-button approve">
                        <BsCheck />
                      </button>
                      <button onClick={() => handleCancelApplication(application._id)} className="action-button cancel">
                        <BsX />
                      </button>
                      <button onClick={() => handleCompleteApplication(application._id)} className="action-button complete">
                        Завершить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'activitylog' && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')}>ID {renderSortIndicator('_id')}</th>
                <th onClick={() => handleSort('userId')}>Пользователь {renderSortIndicator('userId')}</th>
                <th onClick={() => handleSort('action')}>Действие {renderSortIndicator('action')}</th>
                <th onClick={() => handleSort('timestamp')}>Дата {renderSortIndicator('timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData(filteredData).map(log => (
                <tr key={log._id}>
                  <td>{log._id}</td>
                  <td>{log.userId ? log.userId.email : 'Нет данных'}</td>
                  <td>{log.action}</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'reports' && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')}>ID {renderSortIndicator('_id')}</th>
                <th onClick={() => handleSort('applicationId')}>ID заявки {renderSortIndicator('applicationId')}</th>
                <th onClick={() => handleSort('clientName')}>Имя клиента {renderSortIndicator('clientName')}</th>
                <th onClick={() => handleSort('propertyType')}>Тип недвижимости {renderSortIndicator('propertyType')}</th>
                <th onClick={() => handleSort('location')}>Местоположение {renderSortIndicator('location')}</th>
                <th onClick={() => handleSort('price')}>Цена {renderSortIndicator('price')}</th>
                <th onClick={() => handleSort('bedrooms')}>Спальни {renderSortIndicator('bedrooms')}</th>
                <th onClick={() => handleSort('bathrooms')}>Ванные {renderSortIndicator('bathrooms')}</th>
                <th onClick={() => handleSort('area')}>Площадь {renderSortIndicator('area')}</th>
                <th onClick={() => handleSort('description')}>Описание {renderSortIndicator('description')}</th>
                <th onClick={() => handleSort('rating')}>Рейтинг {renderSortIndicator('rating')}</th>
                <th onClick={() => handleSort('createdAt')}>Дата создания {renderSortIndicator('createdAt')}</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedData(filteredData).map(report => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>{report.applicationId}</td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="clientName"
                        value={editReportData.clientName}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.clientName
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="propertyType"
                        value={editReportData.propertyType}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.propertyType
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="location"
                        value={editReportData.location}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.location
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="price"
                        value={editReportData.price}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.price
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="bedrooms"
                        value={editReportData.bedrooms}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.bedrooms
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="bathrooms"
                        value={editReportData.bathrooms}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.bathrooms
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="area"
                        value={editReportData.area}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.area
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="description"
                        value={editReportData.description}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.description
                    )}
                  </td>
                  <td>
                    {editReportId === report._id ? (
                      <input
                        type="text"
                        name="rating"
                        value={editReportData.rating}
                        onChange={handleReportChange}
                      />
                    ) : (
                      report.rating
                    )}
                  </td>
                  <td>{report.createdAt}</td>
                  <td>
                    {editReportId === report._id ? (
                      <div>
                        <button onClick={handleSaveReport} className="action-button confirm">
                          <BsCheck />
                        </button>
                        <button onClick={handleCancelEditReport} className="action-button cancel">
                          <BsX />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => handleEditReport(report)} className="action-button edit">
                          <BsPencil />
                        </button>
                        <button onClick={() => handleDeleteReport(report._id)} className="action-button delete">
                          <BsX />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
          {activeTab === 'employees' && (
          <div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя пользователя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {sortedData(filteredData).map(employee => (
                  <tr key={employee._id}>
                    <td>{employee._id}</td>
                    <td>
                      {editEmployeeId === employee._id ? (
                        <input
                          type="text"
                          name="username"
                          value={editEmployeeData.username}
                          onChange={handleChangeEmployee}
                        />
                      ) : (
                        employee.username
                      )}
                    </td>
                    <td>
                      {editEmployeeId === employee._id ? (
                        <input
                          type="text"
                          name="email"
                          value={editEmployeeData.email}
                          onChange={handleChangeEmployee}
                        />
                      ) : (
                        employee.email
                      )}
                    </td>
                    <td>
                      {editEmployeeId === employee._id ? (
                        editEmployeeData.role
                      ) : (
                        employee.role
                      )}
                    </td>
                    <td>
                      {editEmployeeId === employee._id ? (
                        <div>
                          <button onClick={handleSaveEmployee} className="action-button confirm">
                            <BsCheck />
                          </button>
                          <button onClick={handleCancelEditEmployee} className="action-button cancel">
                            <BsX />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => handleEditEmployee(employee)} className="action-button edit">
                            <BsPencil />
                          </button>
                          <button onClick={() => handleDeleteEmployee(employee._id)} className="action-button delete">
                            <BsX />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="create-employee-form">
            <h3>Создать нового сотрудника</h3>
            <input
              type="text"
              name="username"
              value={newEmployeeData.username}
              onChange={handleInputChange}
              placeholder="Имя пользователя"
              required
            />
            <input
              type="email"
              name="email"
              value={newEmployeeData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              value={newEmployeeData.password}
              onChange={handleInputChange}
              placeholder="Пароль"
              required
            />
            <select name="role" value={newEmployeeData.role} onChange={handleRoleChange}>
              <option value="Сотрудник">Сотрудник</option>
              <option value="Админ">Админ</option>
            </select>
            <button onClick={handleCreateEmployee}>Создать</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminPanel;
