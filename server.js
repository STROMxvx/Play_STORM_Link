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
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ===== БАЗА ДАННЫХ (В ПАМЯТИ) =====
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
        joinDate: '01.01.2020',
        frozen: false,
        frozenReason: null
    }
};

// Ранги и цвета
const rankColors = {
    1: '#ffffff',
    2: '#00ff88',
    3: '#00ccff',
    4: '#aa66ff',
    5: '#ffaa33',
    6: '#ff3366',
    7: '#111111'
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

// ===== ВСЕ ЧАТЫ (ПОЛНЫЙ СПИСОК) =====
const messages = {
    info_chat: [],
    announcements: [],
    complaints: [],
    ideas: [],
    tasks: [],
    warnings_list: [],
    rules: [],
    guest_call: [],
    squad545: [],
    labor_general: [],
    editor: [],
    artist: [],
    animator: [],
    costumer: [],
    grinder: [],
    searcher: [],
    builder: [],
    coder: [],
    hurricane: [],
    moderators: [],
    admin_chat: []
};

// ===== МИДЛВЕР =====
function authRequired(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    next();
}

// ===== СТРАНИЦА ЧАТА =====
app.get('/chat', authRequired, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ===== API: ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ =====
app.get('/api/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ error: 'not authorized' });
    }
    const user = users[req.session.user.nickname];
    if (!user) {
        req.session.destroy();
        return res.json({ error: 'user not found' });
    }
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

// ===== API: ВСЕ ПОЛЬЗОВАТЕЛИ (ТОЛЬКО LVL 7) =====
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
        frozenReason: u.frozenReason,
        birthDate: u.birthDate,
        comment: u.comment,
        joinDate: u.joinDate
    }));
    res.json(allUsers);
});

// ===== API: ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ =====
app.post('/api/addUser', (req, res) => {
    if (!req.session.user || users[req.session.user.nickname]?.lvl !== 7) {
        return res.json({ error: 'access denied' });
    }
    
    const { nickname, name, lvl, subRole, birthDate, comment, password, joinDate } = req.body;
    
    if (!nickname || !name || !password) {
        return res.json({ error: 'Заполните ник, имя и пароль' });
    }
    
    if (users[nickname]) {
        return res.json({ error: 'Пользователь с таким ником уже существует' });
    }
    
    // Используем переданную дату вступления, если есть, иначе сегодняшнюю
    const finalJoinDate = joinDate && joinDate.trim() !== '' ? joinDate : new Date().toLocaleDateString();
    
    users[nickname] = {
        nickname: nickname,
        name: name,
        password: bcrypt.hashSync(password, 10),
        lvl: parseInt(lvl),
        role: rankNames[lvl],
        subRole: subRole || null,
        birthDate: birthDate || '',
        comment: comment || '',
        joinDate: finalJoinDate,
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
    
    const { nickname, name, lvl, subRole, birthDate, comment, joinDate } = req.body;
    
    if (!users[nickname]) {
        return res.json({ error: 'Пользователь не найден' });
    }
    
    users[nickname].name = name;
    users[nickname].lvl = parseInt(lvl);
    users[nickname].role = rankNames[lvl];
    users[nickname].subRole = subRole || null;
    users[nickname].birthDate = birthDate || '';
    users[nickname].comment = comment || '';
    if (joinDate && joinDate.trim() !== '') {
        users[nickname].joinDate = joinDate;
    }
    
    res.json({ success: true });
});

// ===== API: ЗАМОРОЗИТЬ/РАЗМОРОЗИТЬ =====
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
        users[nickname].frozenReason = reason || 'Без причины';
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

// ===== СОКЕТЫ =====
io.on('connection', (socket) => {
    console.log('🔌 Сокет подключён');
    
    socket.on('join chat', (chatName) => {
        if (!messages[chatName]) {
            messages[chatName] = [];
        }
        socket.join(chatName);
        socket.currentChat = chatName;
        socket.emit('chat history', messages[chatName]);
        console.log(`📡 Присоединился к чату: ${chatName}`);
    });
    
    socket.on('send message', (data) => {
        if (!data.chat || !messages[data.chat]) {
            console.log('❌ Неизвестный чат:', data.chat);
            return;
        }
        
        const message = {
            from: data.from,
            text: data.text,
            time: new Date().toLocaleTimeString(),
            lvl: data.lvl,
            color: data.color
        };
        
        messages[data.chat].push(message);
        
        if (messages[data.chat].length > 200) {
            messages[data.chat].shift();
        }
        
        io.to(data.chat).emit('new message', message);
        console.log(`💬 Сообщение в ${data.chat} от ${data.from}`);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Сокет отключён');
    });
});

// ===== ЗАПУСК =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Чат доступен: http://localhost:${PORT}`);
});
