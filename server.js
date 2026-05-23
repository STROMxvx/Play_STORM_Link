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
// ===== МИДЛВЕР ДЛЯ ПРОВЕРКИ АВТОРИЗАЦИИ =====
function authRequired(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    next();
}

// ===== СТРАНИЦА ЧАТА (только для авторизованных) =====
app.get('/chat', authRequired, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ===== API: ПОЛУЧИТЬ ИНФО О ТЕКУЩЕМ ПОЛЬЗОВАТЕЛЕ =====
app.get('/api/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ error: 'not authorized' });
    }
    const user = users[req.session.user.nickname];
    res.json({
        nickname: user.nickname,
        name: user.name,
        lvl: user.lvl,
        role: rankNames[user.lvl],
        subRole: user.subRole,
        color: rankColors[user.lvl],
        frozen: user.frozen
    });
});

// ===== API: ПОЛУЧИТЬ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (для панели владельца) =====
app.get('/api/users', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    const allUsers = Object.values(users).map(u => ({
        nickname: u.nickname,
        name: u.name,
        lvl: u.lvl,
        role: rankNames[u.lvl],
        subRole: u.subRole,
        color: rankColors[u.lvl],
        frozen: u.frozen,
        birthDate: u.birthDate,
        comment: u.comment,
        joinDate: u.joinDate
    }));
    res.json(allUsers);
});

// ===== API: ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ (только LVL 7) =====
app.post('/api/addUser', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    
    const { nickname, name, lvl, subRole, birthDate, comment, password } = req.body;
    
    if (users[nickname]) {
        return res.json({ error: 'Пользователь с таким ником уже существует' });
    }
    
    users[nickname] = {
        nickname: nickname,
        name: name,
        password: bcrypt.hashSync(password, 10),
        lvl: parseInt(lvl),
        role: rankNames[lvl],
        subRole: subRole || null,
        birthDate: birthDate,
        comment: comment || '',
        joinDate: new Date().toLocaleDateString(),
        frozen: false,
        frozenReason: null
    };
    
    res.json({ success: true, message: 'Пользователь добавлен' });
});

// ===== API: РЕДАКТИРОВАТЬ ПОЛЬЗОВАТЕЛЯ =====
app.post('/api/editUser', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    
    const { nickname, name, lvl, subRole, birthDate, comment } = req.body;
    
    if (!users[nickname]) {
        return res.json({ error: 'Пользователь не найден' });
    }
    
    users[nickname].name = name;
    users[nickname].lvl = parseInt(lvl);
    users[nickname].role = rankNames[lvl];
    users[nickname].subRole = subRole || null;
    users[nickname].birthDate = birthDate;
    users[nickname].comment = comment || '';
    
    res.json({ success: true });
});

// ===== API: ЗАМОРОЗИТЬ/РАЗМОРОЗИТЬ ПОЛЬЗОВАТЕЛЯ =====
app.post('/api/toggleFreeze', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    
    const { nickname, reason } = req.body;
    
    if (!users[nickname]) {
        return res.json({ error: 'Пользователь не найден' });
    }
    
    if (users[nickname].frozen) {
        users[nickname].frozen = false;
        users[nickname].frozenReason = null;
        res.json({ success: true, action: 'unfrozen' });
    } else {
        users[nickname].frozen = true;
        users[nickname].frozenReason = reason;
        res.json({ success: true, action: 'frozen', reason: reason });
    }
});

// ===== API: УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ =====
app.post('/api/deleteUser', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    
    const { nickname } = req.body;
    
    if (nickname === 'STORM_X') {
        return res.json({ error: 'Нельзя удалить владельца' });
    }
    
    if (!users[nickname]) {
        return res.json({ error: 'Пользователь не найден' });
    }
    
    delete users[nickname];
    res.json({ success: true });
});

// ===== LOGIN =====
app.post('/login', (req, res) => {
    const { nickname, password } = req.body;
    
    const user = users[nickname];
    if (!user) {
        return res.json({ success: false, error: 'Неверный ник или пароль' });
    }
    
    if (user.frozen) {
        return res.json({ success: false, error: `Аккаунт заморожен. Причина: ${user.frozenReason}` });
    }
    
    if (bcrypt.compareSync(password, user.password)) {
        req.session.user = { nickname: nickname };
        res.json({ success: true, redirect: '/chat' });
    } else {
        res.json({ success: false, error: 'Неверный ник или пароль' });
    }
});

// ===== LOGOUT =====
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// ===== СОКЕТЫ ДЛЯ ЧАТА =====
const messages = {
    info: [],
    announcements: [],
    warnings: [],
    squad545: [],
    hurricane: [],
    general: []
};

io.on('connection', (socket) => {
    console.log('Сокет подключён');
    
    socket.on('join chat', (chatName) => {
        socket.join(chatName);
        socket.currentChat = chatName;
        socket.emit('chat history', messages[chatName] || []);
    });
    
    socket.on('send message', (data) => {
        if (!messages[data.chat]) messages[data.chat] = [];
        messages[data.chat].push({
            from: data.from,
            text: data.text,
            time: new Date().toLocaleTimeString(),
            lvl: data.lvl,
            color: data.color
        });
        io.to(data.chat).emit('new message', {
            from: data.from,
            text: data.text,
            time: new Date().toLocaleTimeString(),
            lvl: data.lvl,
            color: data.color
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
