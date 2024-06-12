import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatDetail.css';

const ChatDetail = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [clientName, setClientName] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  useEffect(() => {
    const verifyEmployee = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
    
      try {
        const response = await axios.get('http://localhost:5000/api/employee/verify-employee', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        if (!response.data.isEmployee) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        navigate('/login');
      }
    };
    verifyEmployee(); 
    if (chatId) {
      fetchChat();
      startFetchInterval(); // Start the fetch interval
    }

    return () => {
      clearInterval(fetchIntervalRef.current); // Clear the interval when component unmounts
    };
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/employee/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setChat(response.data);
      fetchClientName(response.data.userId); 
    } catch (error) {
      console.error('Ошибка при получении чата:', error);
    }
  };

  const startFetchInterval = () => {
    fetchIntervalRef.current = setInterval(fetchChat, 5000);
  };

  const fetchClientName = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:5000/api/employee/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientName(response.data.firstName);
    } catch (error) {
      console.error('Ошибка при получении имени клиента:', error);
    }
  };

  const sendMessage = async () => {
    if (chat.status === 'Завершенный') return;

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(`http://localhost:5000/api/employee/chats/${chatId}/messages`, {
        message
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchChat();
      setMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  };

  const completeChat = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(`http://localhost:5000/api/employee/chats/${chatId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchChat();
    } catch (error) {
      console.error('Ошибка при завершении чата:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-detail-container">
      <div className="chat-header">
        <h2>Чат #{chatId}</h2>
        {chat && (
          <div className="chat-info">
            <p><strong>Статус:</strong> {chat.status}</p>
            <p><strong>Последнее сообщение:</strong> {new Date(chat.lastMessageAt).toLocaleString()}</p>
            <p><strong>Клиент:</strong> {clientName} </p>
          </div>
        )}
      </div>
      <div className="chat-messages">
        {chat && chat.messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'Сотрудник' ? 'sender' : 'reciver'}`}>
            <div className="message-text">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..." 
          disabled={chat?.status === 'Завершенный'}
        />
        <button onClick={sendMessage} disabled={chat?.status === 'Завершенный'}>Отправить</button>
      </div>
      <button onClick={completeChat} disabled={chat?.status === 'Завершенный'}>Завершить чат</button>
    </div>
  );
};

export default ChatDetail;
