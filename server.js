const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Сессии для авторизации
app.use(session({
    secret: 'storm_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 часа
}));

// ===== БАЗА ДАННЫХ (в памяти, потом переделаем на файл) =====
const users = {
    'STORM_X': {
        password: bcrypt.hashSync('xVgoogYu545@stojj0', 10),
        nickname: 'STORM_X',
        name: 'Шторм',
        lvl: 7,
        role: 'Владелец',
        subRole: null,
        birthDate: '01.01.2000',
        comment: 'Создатель',
        joinDate: new Date().toLocaleDateString(),
        frozen: false,
        frozenReason: null
    }
};

// Ранги и их цвета
const rankColors = {
    1: '#ffffff',  // Гость - белый
    2: '#00ff00',  // Squad 545 - зелёный
    3: '#00bfff',  // Трудовой состав - голубой
    4: '#aa00ff',  // Команда Ураган - фиолетовый
    5: '#ff8c00',  // Модератор - оранжевый
    6: '#dc143c',  // Админ - красивый красный
    7: '#000000'   // Владелец - чёрный
};

const rankNames = {
    1: 'Гость',
    2: 'Squad 545',
    3: 'Трудовой состав',
    4: 'Команда Ураган',
    5: 'Модератор',
    6: 'Администратор',
    7: 'Владелец'
};
