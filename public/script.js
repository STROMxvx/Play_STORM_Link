// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let socket = io();
let currentUser = null;
let currentChat = 'info';
let allUsers = [];
let activeSubmenu = null;

// Цвета рангов
const rankColors = {
    1: '#ffffff', 2: '#00ff88', 3: '#00ccff', 4: '#aa66ff',
    5: '#ffaa33', 6: '#ff3366', 7: '#111111'
};

const rankNames = {
    1: '👤 Гость', 2: '🟢 Squad 545', 3: '🔧 Трудовой состав',
    4: '🌀 Команда Ураган', 5: '🛡️ Модератор', 6: '⚙️ Администратор', 7: '👑 Владелец'
};

// Все каналы и права доступа
const chatStructure = {
    info: { name: '📢 Информация', minLvl: 1, parent: null },
    announcements: { name: '📣 Объявления', minLvl: 1, parent: null },
    warnings: { name: '⚠️ Выговоры', minLvl: 1, parent: null },
    calls: { name: '📞 Звонки', minLvl: 1, parent: null, isCallCategory: true,
        subchats: {
            'guest_call': { name: '🎙️ Гостевой', minLvl: 1 },
            'squad545_call': { name: '🟢 Squad 545', minLvl: 2 },
            'record1': { name: '📹 (1) Запись видео', minLvl: 1 },
            'record2': { name: '🎥 (2) Запись видео', minLvl: 2 },
            'record4': { name: '⚡ (⚡) Запись видео', minLvl: 4 },
            'stream': { name: '📡 Стрим', minLvl: 1, inviteOnly: true },
            'workers_meet': { name: '🏭 Совещание рабочих', minLvl: 3, allowedLvls: [3,6] },
            'moderators_meet': { name: '🛡️ Совещание модераторов', minLvl: 5, allowedLvls: [5,6] },
            'admin_channel': { name: '🔒 Канал Администраторов', minLvl: 6, allowedLvls: [6] }
        }
    },
    squad545: { name: '🟢 Squad 545', minLvl: 2, parent: null },
    hurricane: { name: '🌀 Команда Ураган', minLvl: 4, parent: null },
    labor: { name: '🔧 Трудовой состав', minLvl: 3, parent: null,
        subchats: {
            'labor_general': { name: '💬 Общий чат', minLvl: 3, allowedLvls: [3,6] },
            'editor': { name: '✂️ Монтажёр', minLvl: 3, roleRequired: 'Монтажёр' },
            'artist': { name: '🎨 Художник', minLvl: 3, roleRequired: 'Художник' },
            'animator': { name: '🎬 Аниматор', minLvl: 3, roleRequired: 'Аниматор' },
            'costumer': { name: '👘 Костюмер', minLvl: 3, roleRequired: 'Костюмер' },
            'grinder': { name: '⚙️ Нарешик', minLvl: 3, roleRequired: 'Нарешик' },
            'searcher': { name: '🔍 Поисковик', minLvl: 3, roleRequired: 'Поисковик' },
            'builder': { name: '🏗️ Билдер', minLvl: 3, roleRequired: 'Билдер' },
            'coder': { name: '💻 Кодер', minLvl: 3, roleRequired: 'Кодер' }
        }
    },
    moderators: { name: '🛡️ Модераторы', minLvl: 5, parent: null },
    ideas: { name: '💡 Идеи', minLvl: 1, parent: null },
    complaints: { name: '⚠️ Жалобы', minLvl: 1, parent: null },
    tasks: { name: '📋 Задачи', minLvl: 2, parent: null }
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
        
        document.getElementById('userRankBadge').textContent = `${currentUser.lvl} LVL`;
        document.getElementById('userRankBadge').style.background = rankColors[currentUser.lvl];
        document.getElementById('userNick').innerHTML = currentUser.nickname;
        document.getElementById('userName').innerHTML = currentUser.name;
        
        if (currentUser.lvl === 7) {
            document.getElementById('sidebarRight').style.display = 'flex';
            loadMembers();
        } else {
            document.getElementById('sidebarRight').style.display = 'none';
        }
        
        buildChatMenu();
        
    } catch (err) {
        console.error(err);
        window.location.href = '/login.html';
    }
}

function buildChatMenu() {
    const container = document.querySelector('.chats-list');
    if (!container) return;
    container.innerHTML = '';
    
    const mainCategories = ['info', 'announcements', 'warnings', 'calls', 'squad545', 'hurricane', 'labor', 'moderators', 'ideas', 'complaints', 'tasks'];
    
    for (let cat of mainCategories) {
        const chat = chatStructure[cat];
        if (!chat) continue;
        
        let hasAccess = currentUser.lvl >= chat.minLvl;
        if (chat.allowedLvls) hasAccess = chat.allowedLvls.includes(currentUser.lvl);
        
        if (hasAccess) {
            const catDiv = document.createElement('div');
            catDiv.className = 'chat-category';
            catDiv.innerText = chat.name;
            container.appendChild(catDiv);
            
            const mainItem = document.createElement('div');
            mainItem.className = `chat-item ${currentChat === cat ? 'active' : ''}`;
            mainItem.dataset.chat = cat;
            mainItem.innerHTML = `<span class="chat-icon">${chat.name.charAt(0)}</span><span class="chat-name">${chat.name}</span>`;
            mainItem.onclick = () => {
                if (chat.subchats) {
                    toggleSubmenu(cat);
                } else {
                    switchChat(cat);
                }
            };
            container.appendChild(mainItem);
            
            if (chat.subchats && activeSubmenu === cat) {
                for (let [subId, subData] of Object.entries(chat.subchats)) {
                    let subAccess = currentUser.lvl >= subData.minLvl;
                    if (subData.allowedLvls) subAccess = subData.allowedLvls.includes(currentUser.lvl);
                    if (subData.roleRequired && currentUser.subRole !== subData.roleRequired && currentUser.lvl < 6) subAccess = false;
                    if (subAccess) {
                        const subItem = document.createElement('div');
                        subItem.className = `subchat-item ${currentChat === subId ? 'active' : ''}`;
                        subItem.dataset.chat = subId;
                        subItem.innerHTML = `<span class="chat-icon">📎</span><span class="chat-name">${subData.name}</span>`;
                        subItem.onclick = () => switchChat(subId);
                        container.appendChild(subItem);
                    }
                }
            }
        }
    }
}

function toggleSubmenu(cat) {
    if (activeSubmenu === cat) {
        activeSubmenu = null;
    } else {
        activeSubmenu = cat;
    }
    buildChatMenu();
}

function switchChat(chatId) {
    currentChat = chatId;
    buildChatMenu();
    
    let chatDisplayName = chatId;
    for (let [key, val] of Object.entries(chatStructure)) {
        if (val.subchats && val.subchats[chatId]) chatDisplayName = val.subchats[chatId].name;
        else if (key === chatId) chatDisplayName = val.name;
    }
    document.getElementById('currentChatName').innerHTML = chatDisplayName;
    
    document.getElementById('chatMessages').innerHTML = '<div class="welcome-message">Загрузка сообщений...</div>';
    socket.emit('join chat', chatId);
}

socket.on('chat history', (messages) => {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="welcome-message">✨ Сообщений пока нет. Напишите что-нибудь!</div>';
        return;
    }
    messages.forEach(msg => addMessageToChat(msg));
});

socket.on('new message', (msg) => {
    addMessageToChat(msg);
});

function addMessageToChat(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.from === currentUser.nickname;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isOwn ? 'own' : ''}`;
    msgDiv.innerHTML = `
        <div class="message-header">
            <span class="message-rank" style="background: ${msg.color || '#333'}">${msg.lvl || '?'} LVL</span>
            <span class="message-from">${escapeHtml(msg.from)}</span>
            <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-text">${escapeHtml(msg.text)}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===== УПРАВЛЕНИЕ УЧАСТНИКАМИ (LVL7) =====
async function loadMembers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (!data.error) {
            allUsers = data;
            renderMembersList();
        }
    } catch(e) { console.error(e); }
}

function renderMembersList() {
    const container = document.getElementById('membersList');
    if (!container) return;
    const sorted = [...allUsers].sort((a,b) => b.lvl - a.lvl);
    container.innerHTML = sorted.map(user => `
        <div class="member-item" data-nickname="${user.nickname}">
            <div class="member-rank-badge" style="background: ${rankColors[user.lvl]}">${user.lvl} LVL</div>
            <div class="member-info">
                <div class="member-nick">${escapeHtml(user.nickname)}</div>
                <div class="member-name">${escapeHtml(user.name)}</div>
                <div class="member-role">${rankNames[user.lvl]}${user.subRole ? ` · ${user.subRole}` : ''}</div>
            </div>
            ${user.frozen ? '<div class="frozen-badge">❄️</div>' : ''}
        </div>
    `).join('');
    document.querySelectorAll('.member-item').forEach(el => {
        el.addEventListener('click', () => openUserModal(el.dataset.nickname));
    });
}

function openUserModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user) return;
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>👤 ${escapeHtml(user.nickname)}</h3>
        <div style="text-align:center;margin:15px 0;">
            <span style="display:inline-block;padding:6px 20px;background:${rankColors[user.lvl]};border-radius:30px;color:white;font-weight:bold;">${user.lvl} LVL · ${rankNames[user.lvl]}</span>
            ${user.subRole ? `<div style="margin-top:8px;">📌 ${escapeHtml(user.subRole)}</div>` : ''}
        </div>
        <p><strong>👤 Имя:</strong> <span style="color:#ffdd00;">${escapeHtml(user.name)}</span></p>
        <p><strong>🎂 Дата рождения:</strong> ${user.birthDate || '—'}</p>
        <p><strong>📝 Комментарий:</strong> ${user.comment || '—'}</p>
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

function openAddUserModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>➕ Добавить участника</h3>
        <label>Ник (логин):</label><input id="addNickname" placeholder="Ник">
        <label>Имя:</label><input id="addName" placeholder="Имя">
        <label>Пароль:</label><input type="text" id="addPassword" placeholder="Пароль">
        <label>Ранг:</label>
        <select id="addLvl">
            <option value="1">Гость</option><option value="2">Squad 545</option><option value="3">Трудовой состав</option>
            <option value="4">Команда Ураган</option><option value="5">Модератор</option><option value="6">Администратор</option>
        </select>
        <label>Поддолжность:</label><input id="addSubRole" placeholder="Монтажёр, Художник...">
        <label>Дата рождения:</label><input id="addBirthDate" placeholder="ДД.ММ.ГГГГ">
        <label>Комментарий:</label><textarea id="addComment" rows="2"></textarea>
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
    const res = await fetch('/api/addUser', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const result = await res.json();
    if(result.success){ closeModal(); loadMembers(); buildChatMenu(); }
    else alert(result.error);
}

function editUser(nickname){
    const user = allUsers.find(u=>u.nickname===nickname);
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>✏️ Редактировать ${nickname}</h3>
        <label>Имя:</label><input id="editName" value="${user.name}">
        <label>Ранг:</label><select id="editLvl
