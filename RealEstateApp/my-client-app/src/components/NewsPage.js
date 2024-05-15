import React, { useState } from 'react';

const NewsPage = () => {
  // Состояние для хранения данных о новостях
  const [news, setNews] = useState([]);
  // Состояние для хранения данных о новом новостном объявлении
  const [newNews, setNewNews] = useState('');

  // Обработчик для добавления новостного объявления
  const handleAddNews = () => {
    // Создание нового объекта новости
    const newNewsItem = {
      id: news.length + 1, // Генерация уникального идентификатора
      text: newNews
    };
    // Добавление новости в массив новостей
    setNews([...news, newNewsItem]);
    // Очистка поля ввода после добавления
    setNewNews('');
  };

  return (
    <div>
      <h1>Новости</h1>
      {/* Форма для добавления новостного объявления */}
      <div>
        <input
          type="text"
          value={newNews}
          onChange={(e) => setNewNews(e.target.value)}
          placeholder="Введите новость"
        />
        <button onClick={handleAddNews}>Добавить</button>
      </div>
      {/* Отображение списка новостных объявлений */}
      <ul>
        {news.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default NewsPage;
