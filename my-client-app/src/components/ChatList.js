import React from 'react';
import './ChatList.css';

const ChatList = ({ chats, onChatClick }) => {
  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div 
          key={chat._id} 
          className="chat-item" 
          onClick={() => onChatClick(chat._id)}
          style={{ cursor: 'pointer' }} 
        >
          <h3>Чат #{chat._id}</h3>
          <p>Статус: {chat.status}</p>
          <p>Последнее сообщение: {new Date(chat.lastMessageAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
