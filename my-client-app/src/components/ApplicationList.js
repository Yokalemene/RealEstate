import React from 'react';
import './ApplicationList.css';

const ApplicationList = ({ applications, onApplicationClick }) => {
  return (
    <div className="application-list">
      {applications.map((application) => (
        <div 
          key={application._id} 
          className="application-item" 
          onClick={() => onApplicationClick(application._id)}
          style={{ cursor: 'pointer' }} // Add cursor pointer for better UX
        >
          <h3>Заявка #{application._id}</h3>
          <p>Статус: {application.status}</p>
          <p>Дата создания: {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default ApplicationList;
