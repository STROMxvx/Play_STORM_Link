// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let socket = io();
let currentUser = null;
let currentChat = 'info_chat';
let allUsers = [];

// Цвета рангов
const rankColors = {
    1: '#ffffff', 2: '#00ff88', 3: '#00ccff', 4: '#aa66ff',
    5: '#ffaa33', 6: '#ff3366', 7: '#111111'
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

// ===== СТРУКТУРА МЕНЮ (по рангам) =====
const menuStructure = [
    {
        category: "⭐ Основное",
        minLvl: 1,
        items: [
            { id: "info", name: "📢 Информация", isParent: true, subitems: [
                { id: "members_list", name: "👥 Участники", action: "showMembers" },
                { id: "warnings_list", name: "⚠️ Выговоры", action: "showWarnings" },
                { id: "complaints", name: "📋 Жалобы", isChat: true },
                { id: "ideas", name: "💡 Идеи", isChat: true },
                { id: "tasks", name: "📌 Задачи", isChat: true }
            ]},
            { id: "announcements", name: "📣 Объявление", isChat: true },
            { id: "calls_category", name: "📞 Звонки", isParent: true, subitems: [
                { id: "guest_call", name: "🎙️ Гостевой", minLvl: 1, isChat: true },
                { id: "squad545_call", name: "🟢 Squad 545", minLvl: 2, isChat: true },
                { id: "record1", name: "📹 (1) Запись видео", minLvl: 1, isChat: true },
                { id: "record2", name: "🎥 (2) Запись видео", minLvl: 2, isChat: true },
                { id: "record4", name: "⚡ (⚡) Запись видео", minLvl: 4, isChat: true },
                { id: "stream", name: "📡 Стрим", minLvl: 1, isChat: true },
                { id: "workers_meet", name: "🏭 Совещание рабочих", minLvl: 3, isChat: true },
                { id: "moderators_meet", name: "🛡️ Совещание модераторов", minLvl: 5, isChat: true },
                { id: "admin_channel", name: "🔒 Канал Администраторов", minLvl: 6, isChat: true }
            ]}
        ]
    },
    {
        category: "⭐ LVL 2",
        minLvl: 2,
        items: [
            { id: "squad545", name: "🟢 Squad 545", isChat: true }
        ]
    },
    {
        category: "⭐ LVL 3",
        minLvl: 3,
        items: [
            { id: "labor_category", name: "🔧 Трудовой состав", isParent: true, subitems: [
                { id: "labor_general", name: "💬 Общий чат", minLvl: 3, isChat: true },
                { id: "editor", name: "✂️ Монтажёр", roleRequired: "Монтажёр", isChat: true },
                { id: "artist", name: "🎨 Художник", roleRequired: "Художник", isChat: true },
                { id: "animator", name: "🎬 Аниматор", roleRequired: "Аниматор", isChat: true },
                { id: "costumer", name: "👘 Костюмер", roleRequired: "Костюмер", isChat: true },
                { id: "grinder", name: "⚙️ Нарешик", roleRequired: "Нарешик", isChat: true },
                { id: "searcher", name: "🔍 Поисковик", roleRequired: "Поисковик", isChat: true },
                { id: "builder", name: "🏗️ Билдер", roleRequired: "Билдер", isChat: true },
                { id: "coder", name: "💻 Кодер", roleRequired: "Кодер", isChat: true }
            ]}
        ]
    },
    {
        category: "⭐ LVL 4",
        minLvl: 4,
        items: [
            { id: "hurricane", name: "🌀 Команда Ураган", isChat: true }
        ]
    },
    {
        category: "⭐ LVL 5",
        minLvl: 5,
        items: [
            { id: "moderators", name: "🛡️ Модераторы", isChat: true }
        ]
    },
    {
        category: "⭐ LVL 6",
        minLvl: 6,
        items: [
            { id: "admin_chat", name: "🔒 Админ. чат", isChat: true }
        ]
    }
];

// Все чаты для сообщений
const allChatIds = [
    'info_chat', 'announcements', 'complaints', 'ideas', 'tasks',
    'guest_call', 'squad545_call', 'record1', 'record2', 'record4', 'stream', 'workers_meet', 'moderators_meet', 'admin_channel',
    'squad545', 'labor_general', 'editor', 'artist', 'animator', 'costumer', 'grinder', 'searcher', 'builder', 'coder',
    'hurricane', 'moderators', 'admin_chat', 'warnings'
];

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
        
        buildMenu();
        
    } catch (err) {
        console.error(err);
        window.location.href = '/login.html';
    }
}

function buildMenu() {
    const container = document.getElementById('chatsList');
    if (!container) return;
    container.innerHTML = '';
    
    for (const category of menuStructure) {
        if (currentUser.lvl < category.minLvl) continue;
        
        const catDiv = document.createElement('div');
        catDiv.className = 'chat-category';
        catDiv.innerText = category.category;
        container.appendChild(catDiv);
        
        for (const item of category.items) {
            let itemAccess = true;
            if (item.minLvl && currentUser.lvl < item.minLvl) itemAccess = false;
            if (item.roleRequired && currentUser.subRole !== item.roleRequired && currentUser.lvl < 6) itemAccess = false;
            if (!itemAccess) continue;
            
            const mainItem = document.createElement('div');
            mainItem.className = `chat-item ${currentChat === item.id ? 'active' : ''}`;
            mainItem.dataset.parent = item.id;
            mainItem.innerHTML = `<span class="chat-icon">${item.name.charAt(0)}</span><span class="chat-name">${item.name}</span>`;
            
            if (item.isParent) {
                let isOpen = localStorage.getItem(`menu_${item.id}`) === 'open';
                mainItem.style.cursor = 'pointer';
                mainItem.onclick = (e) => {
                    e.stopPropagation();
                    toggleSubmenu(item.id);
                };
                container.appendChild(mainItem);
                
                if (isOpen && item.subitems) {
                    for (const sub of item.subitems) {
                        let subAccess = true;
                        if (sub.minLvl && currentUser.lvl < sub.minLvl) subAccess = false;
                        if (sub.roleRequired && currentUser.subRole !== sub.roleRequired && currentUser.lvl < 6) subAccess = false;
                        if (!subAccess) continue;
                        
                        const subItem = document.createElement('div');
                        subItem.className = `subchat-item ${currentChat === sub.id ? 'active' : ''}`;
                        subItem.dataset.chat = sub.id;
                        if (sub.action === 'showMembers') {
                            subItem.innerHTML = `<span class="chat-icon">👥</span><span class="chat-name">${sub.name}</span>`;
                            subItem.onclick = () => showMembersPanel();
                        } else if (sub.isChat) {
                            subItem.innerHTML = `<span class="chat-icon">💬</span><span class="chat-name">${sub.name}</span>`;
                            subItem.onclick = () => switchChat(sub.id);
                        } else {
                            subItem.innerHTML = `<span class="chat-icon">📌</span><span class="chat-name">${sub.name}</span>`;
                            subItem.onclick = () => switchChat(sub.id);
                        }
                        container.appendChild(subItem);
                    }
                }
            } else if (item.isChat) {
                mainItem.onclick = () => switchChat(item.id);
                container.appendChild(mainItem);
            }
        }
    }
}

function toggleSubmenu(parentId) {
    const current = localStorage.getItem(`menu_${parentId}`);
    if (current === 'open') {
        localStorage.setItem(`menu_${parentId}`, 'closed');
    } else {
        localStorage.setItem(`menu_${parentId}`, 'open');
    }
    buildMenu();
}

function showMembersPanel() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const sorted = [...allUsers].sort((a,b) => b.lvl - a.lvl);
    modalBody.innerHTML = `
        <h3>👥 Все участники</h3>
        <div style="max-height:400px;overflow-y:auto;">
            ${sorted.map(user => `
                <div style="padding:10px;border-bottom:1px solid rgba(0,191,255,0.2);display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="openUserModal('${user.nickname}')">
                    <div style="width:36px;height:36px;border-radius:10px;background:${rankColors[user.lvl]};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">${user.lvl}</div>
                    <div>
                        <div style="color:#ffdd00;font-weight:bold;">${escapeHtml(user.nickname)}</div>
                        <div style="color:#00bfff;font-size:11px;">${rankNames[user.lvl]} ${user.subRole ? '· '+user.subRole : ''}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    modal.style.display = 'block';
}

function switchChat(chatId) {
    currentChat = chatId;
    buildMenu();
    
    let displayName = chatId;
    const names = {
        info_chat: '📢 Информация', announcements: '📣 Объявления', complaints: '📋 Жалобы',
        ideas: '💡 Идеи', tasks: '📌 Задачи', guest_call: '🎙️ Гостевой', squad545_call: '🟢 Squad 545',
        record1: '📹 Запись видео (1)', record2: '🎥 Запись видео (2)', record4: '⚡ Запись видео (⚡)',
        stream: '📡 Стрим', workers_meet: '🏭 Совещание рабочих', moderators_meet: '🛡️ Совещание модераторов',
        admin_channel: '🔒 Канал Администраторов', squad545: '🟢 Squad 545', labor_general: '💬 Общий чат',
        editor: '✂️ Монтажёр', artist: '🎨 Художник', animator: '🎬 Аниматор', costumer: '👘 Костюмер',
        grinder: '⚙️ Нарешик', searcher: '🔍 Поисковик', builder: '🏗️ Билдер', coder: '💻 Кодер',
        hurricane: '🌀 Команда Ураган', moderators: '🛡️ Модераторы', admin_chat: '🔒 Админ. чат', warnings: '⚠️ Выговоры'
    };
    document.getElementById('currentChatName').innerHTML = names[chatId] || chatId;
    
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

// ===== УПРАВЛЕНИЕ УЧАСТНИКАМИ =====
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
            ${currentUser.lvl === 7 ? `
                <button class="user-action-btn edit" onclick="editUser('${user.nickname}')">✏️ Редактировать</button>
                <button class="user-action-btn warn" onclick="giveWarning('${user.nickname}')">📝 Выговор</button>
                <button class="user-action-btn freeze" onclick="toggleFreeze('${user.nickname}')">${user.frozen ? '❄️ Разморозить' : '🔥 Заморозить'}</button>
                ${user.nickname !== 'STORM_X' ? `<button class="user-action-btn delete" onclick="deleteUser('${user.nickname}')">❌ Удалить</button>` : ''}
            ` : '<p style="color:#888;">Просмотр (только чтение)</p>'}
        </div>
    `;
    modal.style.display = 'block';
}

function openAddUserModal() {
    if (currentUser.lvl !== 7) return;
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
    if(result.success){ closeModal(); loadMembers(); buildMenu(); }
    else alert(result.error);
}

function editUser(nickname){
    if (currentUser.lvl !== 7) return;
    const user = allUsers.find(u=>u.nickname===nickname);
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>✏️ Редактировать ${nickname}</h3>
        <label>Имя:</label><input id="editName" value="${user.name}">
        <label>Ранг:</label><select id="editLvl">
            ${[1,2,3,4,5,6,7].map(l=>`<option value="${l}" ${user.lvl===l?'selected':''}>${rankNames[l]}</option>`).join('')}
        </select>
        <label>Поддолжность:</label><input id="editSubRole" value="${user.subRole||''}">
        <label>Дата рождения:</label><input id="editBirthDate" value="${user.birthDate||''}">
        <label>Комментарий:</label><textarea id="editComment" rows="2">${user.comment||''}</textarea>
        <button onclick="submitEditUser('${nickname}')">💾 Сохранить</button>
    `;
}

async function submitEditUser(nickname){
    const data = {
        nickname, name: document.getElementById('editName').value, lvl: document.getElementById('editLvl').value,
        subRole: document.getElementById('editSubRole').value, birthDate: document.getElementById('editBirthDate').value,
        comment: document.getElementById('editComment').value
    };
    const res = await fetch('/api/editUser', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    const result = await res.json();
    if(result.success){ closeModal(); loadMembers(); buildMenu(); }
    else alert(result.error);
}

async function toggleFreeze(nickname){
    if (currentUser.lvl !== 7) return;
    const user = allUsers.find(u=>u.nickname===nickname);
    let reason = null;
    if(!user.frozen) reason = prompt('Причина заморозки:\n- Аккаунт в "Отпуске"\n- Аккаунт взломан\n- Странные активности', 'Аккаунт в "Отпуске"');
    if(!user.frozen && !reason) return;
    const res = await fetch('/api/toggleFreeze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ nickname, reason }) });
    const result = await res.json();
    if(result.success){ closeModal(); loadMembers(); }
    else alert(result.error);
}

function deleteUser(nickname){
    if (currentUser.lvl !== 7) return;
    if(confirm(`Удалить ${nickname}?`)){
        fetch('/api/deleteUser', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ nickname }) })
        .then(r=>r.json()).then(result=>{ if(result.success){ closeModal(); loadMembers(); }else alert(result.error); });
    }
}

function giveWarning(nickname){
    if (currentUser.lvl < 6) return;
    const text = prompt(`Выговор для ${nickname}\nТекст:`);
    if(text) socket.emit('send message', { chat:'warnings', from:currentUser.nickname, text:`🔴 ВЫГОВОР для ${nickname}: ${text}`, lvl:currentUser.lvl, color:rankColors[currentUser.lvl] });
}

function closeModal(){ document.getElementById('modal').style.display = 'none'; }

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.getElementById('logoutBtn')?.addEventListener('click', ()=> window.location.href='/logout');
document.addEventListener('DOMContentLoaded', async ()=>{
    await loadUser();
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });
    document.getElementById('addMemberBtn')?.addEventListener('click', openAddUserModal);
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    window.onclick = e=>{ if(e.target === document.getElementById('modal')) closeModal(); };
    switchChat('info_chat');
});
