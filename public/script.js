// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let socket = io();
let currentUser = null;
let currentChat = 'info';
let allUsers = [];

// Цвета рангов
const rankColors = {
    1: '#ffffff', 2: '#00ff00', 3: '#00bfff', 4: '#aa00ff',
    5: '#ff8c00', 6: '#dc143c', 7: '#000000'
};

const rankNames = {
    1: 'Гость', 2: 'Squad 545', 3: 'Трудовой состав',
    4: 'Команда Ураган', 5: 'Модератор', 6: 'Администратор', 7: 'Владелец'
};

// ===== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ =====
async function loadUser() {
    try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.error) {
            window.location.href = '/login.html';
            return;
        }
        currentUser = data;
        
        // Обновляем профиль
        document.getElementById('userRankBadge').textContent = `${currentUser.lvl} LVL`;
        document.getElementById('userRankBadge').style.background = rankColors[currentUser.lvl];
        document.getElementById('userNick').textContent = currentUser.nickname;
        document.getElementById('userName').textContent = currentUser.name;
        
        // Если владелец - показываем правую панель и загружаем участников
        if (currentUser.lvl === 7) {
            document.getElementById('sidebarRight').style.display = 'flex';
            loadMembers();
        } else {
            document.getElementById('sidebarRight').style.display = 'none';
        }
        
        // Настройка доступных чатов по рангу
        setupChatAccess();
        
    } catch (err) {
        console.error(err);
        window.location.href = '/login.html';
    }
}

// ===== НАСТРОЙКА ДОСТУПА К ЧАТАМ =====
function setupChatAccess() {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const chat = item.dataset.chat;
        let hasAccess = false;
        
        switch(chat) {
            case 'info':
            case 'announcements':
            case 'warnings':
                hasAccess = true;
                break;
            case 'squad545':
                hasAccess = currentUser.lvl >= 2;
                break;
            case 'hurricane':
                hasAccess = currentUser.lvl === 4 || currentUser.lvl >= 6;
                break;
            case 'general':
                hasAccess = currentUser.lvl === 3 || currentUser.lvl >= 6;
                break;
            default:
                hasAccess = false;
        }
        
        if (!hasAccess) {
            item.style.display = 'none';
        }
    });
}

// ===== ЗАГРУЗКА УЧАСТНИКОВ (ТОЛЬКО LVL 7) =====
async function loadMembers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (!data.error) {
            allUsers = data;
            renderMembersList();
        }
    } catch (err) {
        console.error(err);
    }
}

function renderMembersList() {
    const container = document.getElementById('membersList');
    if (!container) return;
    
    // Сортируем по рангу (от высшего к низшему)
    const sorted = [...allUsers].sort((a, b) => b.lvl - a.lvl);
    
    container.innerHTML = sorted.map(user => `
        <div class="member-item" data-nickname="${user.nickname}">
            <div class="member-rank-badge" style="background: ${rankColors[user.lvl]}">
                ${user.lvl} LVL
            </div>
            <div class="member-info">
                <div class="member-nick">${user.nickname}</div>
                <div class="member-name">${user.name}</div>
                <div class="member-role">${user.role}${user.subRole ? ` · ${user.subRole}` : ''}</div>
            </div>
            ${user.frozen ? '<div class="frozen-badge">❄️</div>' : ''}
        </div>
    `).join('');
    
    // Добавляем обработчики кликов
    document.querySelectorAll('.member-item').forEach(el => {
        el.addEventListener('click', () => {
            const nickname = el.dataset.nickname;
            openUserModal(nickname);
        });
    });
}

// ===== ОТКРЫТИЕ МОДАЛКИ ПОЛЬЗОВАТЕЛЯ (ДЛЯ LVL 7) =====
function openUserModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>${user.nickname}</h3>
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; padding: 8px 20px; background: ${rankColors[user.lvl]}; border-radius: 15px; color: white;">
                ${user.lvl} LVL · ${user.role}
            </div>
            ${user.subRole ? `<div style="margin-top: 10px;">📌 ${user.subRole}</div>` : ''}
        </div>
        <p><strong>👤 Имя:</strong> ${user.name}</p>
        <p><strong>🎂 Дата рождения:</strong> ${user.birthDate || 'Не указано'}</p>
        <p><strong>📝 Комментарий:</strong> ${user.comment || 'Нет'}</p>
        <p><strong>📅 Дата поступления:</strong> ${user.joinDate}</p>
        ${user.frozen ? `<p><strong>❄️ Заморожен:</strong> ${user.frozenReason || 'Без причины'}</p>` : ''}
        
        <div class="user-actions-modal">
            <button class="user-action-btn edit" onclick="editUser('${user.nickname}')">✏️ Редактировать</button>
            <button class="user-action-btn warn" onclick="giveWarning('${user.nickname}')">📝 Выговор</button>
            <button class="user-action-btn freeze" onclick="toggleFreeze('${user.nickname}')">${user.frozen ? '❄️ Разморозить' : '🔥 Заморозить'}</button>
            ${user.nickname !== 'STORM_X' ? `<button class="user-action-btn delete" onclick="deleteUser('${user.nickname}')">❌ Удалить</button>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// ===== ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ =====
function openAddUserModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>➕ Добавить участника</h3>
        <label>Ник (логин):</label>
        <input type="text" id="addNickname" placeholder="Ник">
        <label>Имя:</label>
        <input type="text" id="addName" placeholder="Имя">
        <label>Пароль:</label>
        <input type="text" id="addPassword" placeholder="Пароль">
        <label>Ранг:</label>
        <select id="addLvl">
            <option value="1">Гость</option>
            <option value="2">Squad 545</option>
            <option value="3">Трудовой состав</option>
            <option value="4">Команда Ураган</option>
            <option value="5">Модератор</option>
            <option value="6">Администратор</option>
        </select>
        <label>Поддолжность:</label>
        <input type="text" id="addSubRole" placeholder="Например: Монтажёр">
        <label>Дата рождения:</label>
        <input type="text" id="addBirthDate" placeholder="ДД.ММ.ГГГГ">
        <label>Комментарий:</label>
        <textarea id="addComment" rows="2" placeholder="До 120 символов"></textarea>
        <button onclick="submitAddUser()">➕ Добавить</button>
    `;
    
    modal.style.display = 'block';
}

async function submitAddUser() {
    const data = {
        nickname: document.getElementById('addNickname').value,
        name: document.getElementById('addName').value,
        password: document.getElementById('addPassword').value,
        lvl: document.getElementById('addLvl').value,
        subRole: document.getElementById('addSubRole').value,
        birthDate: document.getElementById('addBirthDate').value,
        comment: document.getElementById('addComment').value
    };
    
    const res = await fetch('/api/addUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await res.json();
    if (result.success) {
        closeModal();
        loadMembers();
    } else {
        alert(result.error);
    }
}

// ===== РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ =====
function editUser(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>✏️ Редактировать ${nickname}</h3>
        <label>Имя:</label>
        <input type="text" id="editName" value="${user.name}">
        <label>Ранг:</label>
        <select id="editLvl">
            <option value="1" ${user.lvl === 1 ? 'selected' : ''}>Гость</option>
            <option value="2" ${user.lvl === 2 ? 'selected' : ''}>Squad 545</option>
            <option value="3" ${user.lvl === 3 ? 'selected' : ''}>Трудовой состав</option>
            <option value="4" ${user.lvl === 4 ? 'selected' : ''}>Команда Ураган</option>
            <option value="5" ${user.lvl === 5 ? 'selected' : ''}>Модератор</option>
            <option value="6" ${user.lvl === 6 ? 'selected' : ''}>Администратор</option>
            <option value="7" ${user.lvl === 7 ? 'selected' : ''}>Владелец</option>
        </select>
        <label>Поддолжность:</label>
        <input type="text" id="editSubRole" value="${user.subRole || ''}">
        <label>Дата рождения:</label>
        <input type="text" id="editBirthDate" value="${user.birthDate || ''}">
        <label>Комментарий:</label>
        <textarea id="editComment" rows="2">${user.comment || ''}</textarea>
        <button onclick="submitEditUser('${nickname}')">💾 Сохранить</button>
    `;
}

async function submitEditUser(nickname) {
    const data = {
        nickname: nickname,
        name: document.getElementById('editName').value,
        lvl: document.getElementById('editLvl').value,
        subRole: document.getElementById('editSubRole').value,
        birthDate: document.getElementById('editBirthDate').value,
        comment: document.getElementById('editComment').value
    };
    
    const res = await fetch('/api/editUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await res.json();
    if (result.success) {
        closeModal();
        loadMembers();
    } else {
        alert(result.error);
    }
}

// ===== ЗАМОРОЗКА/РАЗМОРОЗКА =====
function toggleFreeze(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user.frozen) {
        const reason = prompt('Причина заморозки:\n- Аккаунт в "Отпуске"\n- Аккаунт взломан\n- Странные активности', 'Аккаунт в "Отпуске"');
        if (!reason) return;
        submitFreeze(nickname, reason);
    } else {
        submitFreeze(nickname, null);
    }
}

async function submitFreeze(nickname, reason) {
    const res = await fetch('/api/toggleFreeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, reason })
    });
    
    const result = await res.json();
    if (result.success) {
        closeModal();
        loadMembers();
    } else {
        alert(result.error);
    }
}

// ===== УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ =====
function deleteUser(nickname) {
    if (confirm(`Точно удалить ${nickname}?`)) {
        fetch('/api/deleteUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        }).then(res => res.json()).then(result => {
            if (result.success) {
                closeModal();
                loadMembers();
            } else {
                alert(result.error);
            }
        });
    }
}

// ===== ВЫГОВОР =====
function giveWarning(nickname) {
    const text = prompt(`Выговор для ${nickname}\nВведите текст выговора:`);
    if (!text) return;
    
    // Отправляем в чат выговоров
    socket.emit('send message', {
        chat: 'warnings',
        from: currentUser.nickname,
        text: `🔴 ВЫГОВОР для ${nickname}: ${text}`,
        lvl: currentUser.lvl,
        color: rankColors[currentUser.lvl]
    });
    
    closeModal();
}

// ===== ЗАКРЫТИЕ МОДАЛКИ =====
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// ===== СОКЕТЫ И ЧАТ =====
function switchChat(chatName) {
    currentChat = chatName;
    
    // Обновляем активный класс
    document.querySelectorAll('.chat-item').forEach(el => {
        if (el.dataset.chat === chatName) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Обновляем заголовок
    const chatNames = {
        info: 'Информация',
        announcements: 'Объявления',
        warnings: 'Выговоры',
        squad545: 'Squad 545',
        hurricane: 'Команда Ураган',
        general: 'Общий чат (Трудовой состав)'
    };
    document.getElementById('currentChatName').textContent = chatNames[chatName] || chatName;
    
    // Очищаем сообщения
    document.getElementById('chatMessages').innerHTML = '';
    
    // Присоединяемся к чату
    socket.emit('join chat', chatName);
}

socket.on('chat history', (messages) => {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    messages.forEach(msg => addMessageToChat(msg));
});

socket.on('new message', (msg) => {
    addMessageToChat(msg);
});

function addMessageToChat(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.from === currentUser.nickname;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : ''}`;
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-rank" style="background: ${msg.color}">${msg.lvl} LVL</span>
            <span class="message-from">${msg.from}</span>
            <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-text">${escapeHtml(msg.text)}</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;
    
    socket.emit('send message', {
        chat: currentChat,
        from: currentUser.nickname,
        text: text,
        lvl: currentUser.lvl,
        color: rankColors[currentUser.lvl]
    });
    
    input.value = '';
}

// ===== ВЫХОД =====
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    window.location.href = '/logout';
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadUser();
    
    // Обработчики чатов
    document.querySelectorAll('.chat-item').forEach(el => {
        el.addEventListener('click', () => {
            switchChat(el.dataset.chat);
        });
    });
    
    // Отправка сообщения
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Добавление участника
    document.getElementById('addMemberBtn')?.addEventListener('click', openAddUserModal);
    
    // Закрытие модалки
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    window.onclick = (e) => {
        if (e.target === document.getElementById('modal')) closeModal();
    };
    
    // Загружаем первый чат
    switchChat('info');
});
