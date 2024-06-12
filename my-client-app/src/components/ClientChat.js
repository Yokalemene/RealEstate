import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './ClientChat.css'; 

const ClientChat = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [newChat, setNewChat] = useState(true);
  const chatEndRef = useRef(null);
  const socket = useRef(null);
  const fetchIntervalRef = useRef(null);

  useEffect(() => {
    fetchChats();
    socket.current = io('http://localhost:5000');
    socket.current.on('message', fetchChats);

    // Start the fetch interval
    startFetchInterval();

    return () => {
      socket.current.disconnect();
      clearInterval(fetchIntervalRef.current); // Clear the interval when component unmounts
    };
  }, []);

  useEffect(() => {
    if (currentChat) {
      scrollToBottom();
      socket.current.emit('join', currentChat);
    }
  }, [currentChat, chats]);

  const fetchChats = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get('http://localhost:5000/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChats(response.data.reverse()); // Сортировка по дате создания
    } catch (error) {
      console.error('Ошибка при получении чатов:', error);
    }
  };

  const startFetchInterval = () => {
    fetchIntervalRef.current = setInterval(fetchChats, 5000);
  };

  const createChat = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.post('http://localhost:5000/api/create-chat', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentChat(response.data._id);
      setNewChat(true);
      fetchChats(); // Обновляем список чатов
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post(`http://localhost:5000/api/chats/${currentChat}/messages`, {
        message
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchChats();
      socket.current.emit('message', currentChat);
      setMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  };

  const handleChatSelection = (chatId, isNewChat) => {
    setCurrentChat(chatId);
    setNewChat(isNewChat);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="client-chat-container">
      <div className="chats-sidebar">
        <button onClick={createChat} className="create-chat-button">Создать новый чат</button>
        <div className="chats-list">
          {chats.map(chat => (
            <div 
              key={chat._id} 
              onClick={() => handleChatSelection(chat._id, false)}
              className={`chat-item ${currentChat === chat._id ? 'selected' : ''}`}
            >
              Чат #{chat._id} ({chat.status})
            </div>
          ))}
        </div>
      </div>
      {currentChat && (
        <div className="chat-window">
          <div className="chat-messages">
            {chats.find(chat => chat._id === currentChat)?.messages
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Сортировка по возрастанию даты
              .map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'Клиент' ? 'sender' : 'reciver'}`}>
                  <div className="message-text"><strong>{msg.sender}:</strong> {msg.message}</div>
                </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение"
              disabled={chats.find(chat => chat._id === currentChat)?.status === 'Завершенный'}
            />
            <button 
              onClick={sendMessage} 
              disabled={chats.find(chat => chat._id === currentChat)?.status === 'Завершенный'}
            >
              Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientChat;
