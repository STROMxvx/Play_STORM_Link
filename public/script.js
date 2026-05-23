let socket = io();
let currentUser = null;
let currentChat = 'info_chat';
let allUsers = [];
let complaintsCounter = 1;
let callActive = false;
let callChannel = null;
let localStream = null;
let micEnabled = true;
let camEnabled = false;

const rankColors = { 1: '#ffffff', 2: '#00ff88', 3: '#00ccff', 4: '#aa66ff', 5: '#ffaa33', 6: '#ff3366', 7: '#111111' };
const rankNames = { 1: 'Гость', 2: 'Squad 545', 3: 'Трудовой состав', 4: 'Команда Ураган', 5: 'Модератор', 6: 'Администратор', 7: 'Владелец' };

const rulesText = `<div style="padding:10px">
    <h2 style="color:#ffdd00;text-align:center">📜 ПРАВИЛА СООБЩЕСТВА</h2>
    <div style="margin:20px 0">
        <div style="display:flex;background:#ff3366;padding:8px;border-radius:8px;margin-bottom:10px">
            <div style="flex:2;font-weight:bold;color:white">❌ ЗАПРЕЩАЕТСЯ</div>
            <div style="flex:1;font-weight:bold;color:white">⚡ НАКАЗАНИЕ</div>
        </div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Унижения и оскорбления игроков</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Отказ от защиты члена команды</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Флуд, боты, стикеры</div><div style="flex:1;color:#ffaa33">Мут 10мин / 1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Неуважение к участникам</div><div style="flex:1;color:#ffaa33">Мут 15мин / Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Превышение полномочий</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Ссылки без разрешения 6+ LVL</div><div style="flex:1;color:#ffaa33">Мут 30мин / Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Оскорбления игроков</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Спам сообщений</div><div style="flex:1;color:#ffaa33">Мут 10-120мин / Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Оскорбление труда участников</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Неуместная критика</div><div style="flex:1;color:#ffaa33">Мут 24ч / 1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Споры и скандалы</div><div style="flex:1;color:#ffaa33">Мут 24ч / Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Упоминание прошлого</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Давать задания участникам с пометкой -ОТПУСК-</div><div style="flex:1;color:#ffaa33">1 Выговор</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Агрессия и неадекватное поведение</div><div style="flex:1;color:#ffaa33">1-2 Выговора</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Неуважение к старшему составу</div><div style="flex:1;color:#ff6666">2 Выговора / Бан</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Срыв съёмок или стримов</div><div style="flex:1;color:#ff6666">2 Выговора / Бан</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Оскорбление родных</div><div style="flex:1;color:#ff6666">2 Выговора / Бан</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Оскорбление администрации</div><div style="flex:1;color:#ff4444">БАН</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Предательство</div><div style="flex:1;color:#ff4444">БАН</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Переманивание участников</div><div style="flex:1;color:#ff4444">БАН + ЧС</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Слив информации</div><div style="flex:1;color:#ff4444">БАН + ЧС</div></div>
    </div>
    <div style="margin:20px 0">
        <div style="display:flex;background:#ff4444;padding:8px;border-radius:8px;margin-bottom:10px">
            <div style="flex:2;font-weight:bold;color:white">⚠️ ОСОБО ЗАПРЕЩАЕТСЯ</div>
            <div style="flex:1;font-weight:bold;color:white">⚡ НАКАЗАНИЕ</div>
        </div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Разговоры о политике</div><div style="flex:1;color:#ff4444">Бан</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Контент 18+</div><div style="flex:1;color:#ff4444">Мут 7н / Бан</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Призывы к митингам, бунтам</div><div style="flex:1;color:#ff4444">БАН + ЧС</div></div>
        <div style="display:flex;padding:6px;border-bottom:1px solid rgba(0,191,255,0.2)"><div style="flex:2">Нарушение УК РФ и СНГ</div><div style="flex:1;color:#ff4444">БАН + ЧС</div></div>
    </div>
</div>`;

const menuStructure = [
    { category: "⭐ Основное", minLvl: 1, items: [
        { id: "info", name: "📢 Информация", isParent: true, subitems: [
            { id: "members_list", name: "👥 Участники", action: "showMembers" },
            { id: "warnings_list", name: "⚠️ Выговоры", isChat: true },
            { id: "complaints", name: "📋 Жалобы", isChat: true, hasComplaintBtn: true },
            { id: "ideas", name: "💡 Идеи", isChat: true },
            { id: "tasks", name: "📌 Задачи", isChat: true },
            { id: "rules", name: "📜 Правила", isChat: true, readOnly: true }
        ]},
        { id: "announcements", name: "📣 Объявление", isChat: true },
        { id: "calls_category", name: "📞 Звонки", isParent: true, subitems: [
            { id: "guest_call", name: "🎙️ Гостевой", minLvl: 1, isCall: true },
            { id: "squad545_call", name: "🟢 Squad 545", minLvl: 2, isCall: true },
            { id: "record1", name: "📹 Запись видео (1)", minLvl: 1, isCall: true },
            { id: "record2", name: "🎥 Запись видео (2)", minLvl: 2, isCall: true },
            { id: "record4", name: "⚡ Запись видео (⚡)", minLvl: 4, isCall: true },
            { id: "stream", name: "📡 Стрим", minLvl: 1, isCall: true },
            { id: "workers_meet", name: "🏭 Совещание рабочих", minLvl: 3, isCall: true },
            { id: "moderators_meet", name: "🛡️ Совещание модераторов", minLvl: 5, isCall: true },
            { id: "admin_channel", name: "🔒 Канал Администраторов", minLvl: 6, isCall: true }
        ]}
    ]},
    { category: "⭐ LVL 2", minLvl: 2, items: [{ id: "squad545", name: "🟢 Squad 545", isChat: true }] },
    { category: "⭐ LVL 3", minLvl: 3, items: [{ id: "labor_category", name: "🔧 Трудовой состав", isParent: true, subitems: [
        { id: "labor_general", name: "💬 Общий чат", minLvl: 3, isChat: true },
        { id: "editor", name: "✂️ Монтажёр", roleRequired: "Монтажёр", isChat: true },
        { id: "artist", name: "🎨 Художник", roleRequired: "Художник", isChat: true },
        { id: "animator", name: "🎬 Аниматор", roleRequired: "Аниматор", isChat: true },
        { id: "costumer", name: "👘 Костюмер", roleRequired: "Костюмер", isChat: true },
        { id: "grinder", name: "⚙️ Нарешик", roleRequired: "Нарешик", isChat: true },
        { id: "searcher", name: "🔍 Поисковик", roleRequired: "Поисковик", isChat: true },
        { id: "builder", name: "🏗️ Билдер", roleRequired: "Билдер", isChat: true },
        { id: "coder", name: "💻 Кодер", roleRequired: "Кодер", isChat: true }
    ]}]},
    { category: "⭐ LVL 4", minLvl: 4, items: [{ id: "hurricane", name: "🌀 Команда Ураган", isChat: true }] },
    { category: "⭐ LVL 5", minLvl: 5, items: [{ id: "moderators", name: "🛡️ Модераторы", isChat: true }] },
    { category: "⭐ LVL 6", minLvl: 6, items: [{ id: "admin_chat", name: "🔒 Админ. чат", isChat: true }] }
];

async function loadUser() {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (data.error) { window.location.href = '/login.html'; return; }
    currentUser = data;
    document.getElementById('userRankBadge').textContent = `${currentUser.lvl} LVL`;
    document.getElementById('userRankBadge').style.background = rankColors[currentUser.lvl];
    document.getElementById('userNick').innerHTML = currentUser.nickname;
    document.getElementById('userName').innerHTML = currentUser.name;
    if (currentUser.lvl === 7) { document.getElementById('sidebarRight').style.display = 'flex'; loadMembers(); }
    buildMenu();
}

function buildMenu() {
    const container = document.getElementById('chatsList');
    if (!container) return;
    container.innerHTML = '';
    for (const category of menuStructure) {
        if (currentUser.lvl < category.minLvl) continue;
        const catDiv = document.createElement('div'); catDiv.className = 'chat-category'; catDiv.innerText = category.category; container.appendChild(catDiv);
        for (const item of category.items) {
            let access = true;
            if (item.minLvl && currentUser.lvl < item.minLvl) access = false;
            if (item.roleRequired && currentUser.subRole !== item.roleRequired && currentUser.lvl < 6) access = false;
            if (!access) continue;
            const mainItem = document.createElement('div'); mainItem.className = `chat-item ${currentChat === item.id ? 'active' : ''}`;
            mainItem.innerHTML = `<span class="chat-icon">${item.name.charAt(0)}</span><span class="chat-name">${item.name}</span>`;
            if (item.isParent) {
                let isOpen = localStorage.getItem(`menu_${item.id}`) === 'open';
                mainItem.onclick = (e) => { e.stopPropagation(); toggleSubmenu(item.id); };
                container.appendChild(mainItem);
                if (isOpen && item.subitems) {
                    for (const sub of item.subitems) {
                        let subAccess = true;
                        if (sub.minLvl && currentUser.lvl < sub.minLvl) subAccess = false;
                        if (sub.roleRequired && currentUser.subRole !== sub.roleRequired && currentUser.lvl < 6) subAccess = false;
                        if (!subAccess) continue;
                        const subItem = document.createElement('div'); subItem.className = `subchat-item ${currentChat === sub.id ? 'active' : ''}`;
                        if (sub.action === 'showMembers') { subItem.innerHTML = `👥 ${sub.name}`; subItem.onclick = () => showMembersPanel(); }
                        else if (sub.isCall) { subItem.innerHTML = `📞 ${sub.name}`; subItem.onclick = () => joinCallChannel(sub.id); }
                        else { subItem.innerHTML = `💬 ${sub.name}`; subItem.onclick = () => switchChat(sub.id); }
                        container.appendChild(subItem);
                    }
                }
            } else if (item.isChat) { mainItem.onclick = () => switchChat(item.id); container.appendChild(mainItem); }
            else if (item.isCall) { mainItem.onclick = () => joinCallChannel(item.id); container.appendChild(mainItem); }
        }
    }
}

function toggleSubmenu(parentId) { localStorage.setItem(`menu_${parentId}`, localStorage.getItem(`menu_${parentId}`) === 'open' ? 'closed' : 'open'); buildMenu(); }

function switchChat(chatId) {
    currentChat = chatId; buildMenu();
    const win = document.getElementById('callWindow');
    if (callActive && win.style.display !== 'none') { win.style.width = '280px'; win.style.height = 'auto'; const vid = win.querySelector('video'); if(vid) vid.style.height = '120px'; }
    
    const names = { info_chat:'📢 Информация', announcements:'📣 Объявления', complaints:'📋 Жалобы', ideas:'💡 Идеи', tasks:'📌 Задачи', rules:'📜 Правила', warnings:'⚠️ Выговоры', guest_call:'🎙️ Гостевой', squad545_call:'🟢 Squad 545', record1:'📹 Запись видео (1)', record2:'🎥 Запись видео (2)', record4:'⚡ Запись видео (⚡)', stream:'📡 Стрим', workers_meet:'🏭 Совещание рабочих', moderators_meet:'🛡️ Совещание модераторов', admin_channel:'🔒 Канал Администраторов', squad545:'🟢 Squad 545', labor_general:'💬 Общий чат', editor:'✂️ Монтажёр', artist:'🎨 Художник', animator:'🎬 Аниматор', costumer:'👘 Костюмер', grinder:'⚙️ Нарешик', searcher:'🔍 Поисковик', builder:'🏗️ Билдер', coder:'💻 Кодер', hurricane:'🌀 Команда Ураган', moderators:'🛡️ Модераторы', admin_chat:'🔒 Админ. чат' };
    document.getElementById('currentChatName').innerHTML = names[chatId] || chatId;
    
    const inputArea = document.getElementById('chatInputArea');
    if (chatId === 'complaints') {
        inputArea.innerHTML = `<input type="text" id="messageInput" placeholder="Введите сообщение..." style="flex:1;padding:12px;background:#0a1e3a;border:1px solid #00bfff;border-radius:30px;color:#ffdd00"><button id="complaintBtn" style="padding:12px 24px;background:#ff3366;border:none;border-radius:30px;color:white;font-weight:bold">📋 Подать жалобу</button><button id="sendBtn" style="padding:12px 24px;background:#00bfff;border:none;border-radius:30px">📤</button>`;
        document.getElementById('complaintBtn')?.addEventListener('click', openComplaintModal);
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });
    } else if (chatId === 'rules') {
        if (currentUser.lvl === 7) {
            inputArea.innerHTML = `<div style="width:100%;display:flex;gap:10px;"><button id="editRulesBtn" style="padding:12px 24px;background:#ffdd00;color:#000;border:none;border-radius:30px;font-weight:bold;">✏️ Редактировать правила</button><button id="saveRulesBtn" style="display:none;padding:12px 24px;background:#00ff88;color:#000;border:none;border-radius:30px;font-weight:bold;">💾 Сохранить</button></div>`;
            document.getElementById('editRulesBtn')?.addEventListener('click', () => {
                const msgDiv = document.getElementById('chatMessages');
                const currentText = msgDiv.innerText;
                msgDiv.innerHTML = `<textarea id="rulesEditor" style="width:100%;height:400px;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;padding:15px;border-radius:15px;font-size:14px;">${currentText}</textarea>`;
                document.getElementById('editRulesBtn').style.display = 'none';
                document.getElementById('saveRulesBtn').style.display = 'block';
            });
            document.getElementById('saveRulesBtn')?.addEventListener('click', () => {
                const newText = document.getElementById('rulesEditor').value;
                socket.emit('send message', { chat: 'rules', from: currentUser.nickname, text: newText, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
                document.getElementById('editRulesBtn').style.display = 'block';
                document.getElementById('saveRulesBtn').style.display = 'none';
                switchChat('rules');
            });
        } else {
            inputArea.innerHTML = `<div style="width:100%;text-align:center;color:#888;padding:10px">🔒 Чат только для чтения</div>`;
        }
    } else {
        inputArea.innerHTML = `<input type="text" id="messageInput" placeholder="Введите сообщение..." style="flex:1;padding:12px;background:#0a1e3a;border:1px solid #00bfff;border-radius:30px;color:#ffdd00"><button id="sendBtn" style="padding:12px 24px;background:#00bfff;border:none;border-radius:30px">📤</button>`;
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });
    }
    
    document.getElementById('chatMessages').innerHTML = '<div class="welcome-message">Загрузка...</div>';
    if (chatId === 'rules') { document.getElementById('chatMessages').innerHTML = rulesText; }
    else { socket.emit('join chat', chatId); }
}

function joinCallChannel(channelId) {
    if (!callActive) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => { localStream = stream; document.getElementById('localVideo').srcObject = stream; openCallWindow(channelId); })
            .catch(err => { alert('Нет доступа к микрофону'); openCallWindow(channelId); });
    } else { openCallWindow(channelId); }
}

function openCallWindow(channelName) {
    callChannel = channelName; callActive = true;
    const win = document.getElementById('callWindow');
    win.style.display = 'block'; win.style.width = '320px';
    document.getElementById('callStatus').innerHTML = `${channelName} 🔴`;
    document.getElementById('participantsList').innerHTML = `<div>👤 ${currentUser.nickname} (вы)</div>`;
}

function closeCallWindow() {
    callActive = false; document.getElementById('callWindow').style.display = 'none';
    if (localStream) { localStream.getTracks().forEach(track => track.stop()); localStream = null; }
}

function openComplaintModal() {
    const modal = document.getElementById('modal'); const modalBody = document.getElementById('modalBody');
    const usersList = allUsers.map(u => `<option value="${u.nickname}">${u.nickname} (${u.name}) - ${rankNames[u.lvl]}</option>`).join('');
    const violations = ["Унижения и оскорбления игроков", "Отказ от защиты", "Флуд", "Неуважение", "Превышение полномочий", "Ссылки без разрешения", "Оскорбления", "Спам", "Оскорбление труда", "Неуместная критика", "Споры", "Агрессия", "Неуважение к старшим"];
    modalBody.innerHTML = `<h3>📋 ЖАЛОБА №${complaintsCounter}</h3>
        <label>👤 Подающий жалобу:</label><select id="complainantNick">${usersList}</select>
        <label>👤 На кого жалоба:</label><select id="targetNick">${usersList}</select>
        <label>📝 Описание:</label><textarea id="complaintDesc" rows="2"></textarea>
        <label>⚠️ Что нарушил:</label><select id="violationSelect"><option value="">-- Выберите --</option>${violations.map(v=>`<option value="${v}">${v}</option>`).join('')}</select>
        <label>⚡ Наказание:</label><input id="punishment" placeholder="Выговор / Бан">
        <button onclick="submitComplaint()">📨 Отправить</button>`;
    modal.style.display = 'block';
}

function submitComplaint() {
    const complainant = document.getElementById('complainantNick')?.value;
    const target = document.getElementById('targetNick')?.value;
    const desc = document.getElementById('complaintDesc')?.value;
    const violation = document.getElementById('violationSelect')?.value;
    const punishment = document.getElementById('punishment')?.value;
    if (!complainant || !target || !desc) { alert("Заполните все поля"); return; }
    const msg = `📋 ЖАЛОБА №${complaintsCounter}\n👤 Подал: ${complainant}\n👤 На: ${target}\n📝 ${desc}\n⚠️ ${violation}\n⚡ ${punishment}\n📅 ${new Date().toLocaleString()}`;
    socket.emit('send message', { chat:'complaints', from:currentUser.nickname, text:msg, lvl:currentUser.lvl, color:rankColors[currentUser.lvl] });
    complaintsCounter++; closeModal(); alert("Жалоба отправлена!");
}

socket.on('chat history', (messages) => {
    const container = document.getElementById('chatMessages'); container.innerHTML = '';
    if (!messages || messages.length === 0) { container.innerHTML = '<div class="welcome-message">✨ Сообщений пока нет.</div>'; return; }
    messages.forEach(msg => addMessageToChat(msg));
});
socket.on('new message', (msg) => addMessageToChat(msg));

function addMessageToChat(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.from === currentUser.nickname;
    const msgDiv = document.createElement('div'); msgDiv.className = `message ${isOwn ? 'own' : ''}`;
    msgDiv.innerHTML = `<div class="message-header"><span class="message-rank" style="background:${msg.color||'#333'}">${msg.lvl} LVL</span><span class="message-from">${escapeHtml(msg.from)}</span><span class="message-time">${msg.time}</span></div><div class="message-text">${escapeHtml(msg.text)}</div>`;
    container.appendChild(msgDiv); container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput'); if (!input) return;
    const text = input.value.trim(); if (!text) return;
    if (currentChat === 'rules' && currentUser.lvl !== 7) { alert("Только LVL 7 может писать в правила"); return; }
    socket.emit('send message', { chat:currentChat, from:currentUser.nickname, text:text, lvl:currentUser.lvl, color:rankColors[currentUser.lvl] });
    input.value = '';
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }

function showMembersPanel() {
    const modal = document.getElementById('modal'); const modalBody = document.getElementById('modalBody');
    const sorted = [...allUsers].sort((a,b)=>b.lvl-a.lvl);
    modalBody.innerHTML = `<h3>👥 Все участники</h3><div style="max-height:400px;overflow-y:auto;">${sorted.map(user => `<div style="padding:10px;border-bottom:1px solid rgba(0,191,255,0.2);display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="openUserModal('${user.nickname}')"><div style="width:36px;height:36px;border-radius:10px;background:${rankColors[user.lvl]};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">${user.lvl}</div><div><div style="color:#ffdd00;font-weight:bold;">${escapeHtml(user.nickname)}</div><div style="color:#00bfff;font-size:11px;">${rankNames[user.lvl]} ${user.subRole ? '· '+user.subRole : ''}</div></div></div>`).join('')}</div>`;
    modal.style.display = 'block';
}

function openUserModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname); if (!user) return;
    const joinDate = new Date(user.joinDate); const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear(); let months = now.getMonth() - joinDate.getMonth();
    if (months < 0) { years--; months += 12; }
    let exp = years > 0 ? `${years} г${years>1?'а':''} ${months>0?months+' мес.':''}` : months > 0 ? `${months} мес.` : '< 1 мес.';
    const modal = document.getElementById('modal'); const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `<h3>👤 ${escapeHtml(user.nickname)}</h3><div style="text-align:center;margin:15px 0;"><span style="display:inline-block;padding:6px 20px;background:${rankColors[user.lvl]};border-radius:30px;color:white;font-weight:bold;">${user.lvl} LVL · ${rankNames[user.lvl]}</span>${user.subRole?`<div style="margin-top:8px;">📌 ${escapeHtml(user.subRole)}</div>`:''}</div>
        <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(user.nickname)}</span></p><p><strong>👤 Имя:</strong> <span style="color:#ffdd00;">${escapeHtml(user.name)}</span></p>
        <p><strong>🎂 ДР:</strong> ${user.birthDate||'—'}</p><p><strong>📅 Вступление:</strong> ${user.joinDate} → <span style="color:#ffdd00;">${exp}</span></p>
        <p><strong>📝 Коммент:</strong> ${user.comment||'—'}</p>${user.frozen?`<p><strong>❄️ Заморожен:</strong> ${user.frozenReason}</p>`:''}
        <div class="user-actions-modal">${currentUser.lvl===7?`<button class="user-action-btn edit" onclick="editUser('${user.nickname}')">✏️</button><button class="user-action-btn warn" onclick="giveWarning('${user.nickname}')">📝</button><button class="user-action-btn freeze" onclick="toggleFreeze('${user.nickname}')">${user.frozen?'❄️':'🔥'}</button>${user.nickname!=='STORM_X'?`<button class="user-action-btn delete" onclick="deleteUser('${user.nickname}')">❌</button>`:''}`:'<p style="color:#888;">👁️ Просмотр</p>'}</div>`;
    modal.style.display = 'block';
}

async function loadMembers() { const res = await fetch('/api/users'); const data = await res.json(); if(!data.error){ allUsers = data; renderMembersList(); } }
function renderMembersList() { const container = document.getElementById('membersList'); if(!container) return; const sorted = [...allUsers].sort((a,b)=>b.lvl-a.lvl); container.innerHTML = sorted.map(user => `<div class="member-item" data-nickname="${user.nickname}"><div class="member-rank-badge" style="background:${rankColors[user.lvl]}">${user.lvl} LVL</div><div class="member-info"><div class="member-nick">${escapeHtml(user.nickname)}</div><div class="member-name">${escapeHtml(user.name)}</div><div class="member-role">${rankNames[user.lvl]}${user.subRole?` · ${user.subRole}`:''}</div></div>${user.frozen?'<div class="frozen-badge">❄️</div>':''}</div>`).join(''); document.querySelectorAll('.member-item').forEach(el=>el.addEventListener('click',()=>openUserModal(el.dataset.nickname))); }
function openAddUserModal() { if(currentUser.lvl!==7) return; const modal=document.getElementById('modal'); modal.innerHTML=`<div class="modal-content"><span class="modal-close">&times;</span><div id="modalBody"><h3>➕ Добавить</h3><label>Ник:</label><input id="addNickname"><label>Имя:</label><input id="addName"><label>Пароль:</label><input id="addPassword" type="text"><label>Ранг:</label><select id="addLvl"><option value="1">Гость</option><option value="2">Squad 545</option><option value="3">Трудовой состав</option><option value="4">Ураган</option><option value="5">Модератор</option><option value="6">Админ</option></select><label>Подроль:</label><input id="addSubRole"><label>ДР:</label><input id="addBirthDate"><label>Коммент:</label><textarea id="addComment"></textarea><button onclick="submitAddUser()">✅ Создать</button></div></div>`; modal.style.display='block'; document.querySelector('.modal-close').onclick=closeModal; }
async function submitAddUser(){ const data={ nickname:document.getElementById('addNickname').value, name:document.getElementById('addName').value, password:document.getElementById('addPassword').value, lvl:document.getElementById('addLvl').value, subRole:document.getElementById('addSubRole').value, birthDate:document.getElementById('addBirthDate').value, comment:document.getElementById('addComment').value }; const res=await fetch('/api/addUser',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); const result=await res.json(); if(result.success){ closeModal(); loadMembers(); buildMenu(); } else alert(result.error); }
function editUser(nickname){ if(currentUser.lvl!==7) return; const user=allUsers.find(u=>u.nickname===nickname); const modalBody=document.getElementById('modalBody'); modalBody.innerHTML=`<h3>✏️ Редакт ${nickname}</h3><label>Имя:</label><input id="editName" value="${user.name}"><label>Ранг:</label><select id="editLvl">${[1,2,3,4,5,6,7].map(l=>`<option value="${l}" ${user.lvl===l?'selected':''}>${rankNames[l]}</option>`).join('')}</select><label>Подроль:</label><input id="editSubRole" value="${user.subRole||''}"><label>ДР:</label><input id="editBirthDate" value="${user.birthDate||''}"><label>Коммент:</label><textarea id="editComment">${user.comment||''}</textarea><button onclick="submitEditUser('${nickname}')">💾 Сохранить</button>`; }
async function submitEditUser(nickname){ const data={ nickname, name:document.getElementById('editName').value, lvl:document.getElementById('editLvl').value, subRole:document.getElementById('editSubRole').value, birthDate:document.getElementById('editBirthDate').value, comment:document.getElementById('editComment').value }; const res=await fetch('/api/editUser',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); const result=await res.json(); if(result.success){ closeModal(); loadMembers(); buildMenu(); } else alert(result.error); }
async function toggleFreeze(nickname){ if(currentUser.lvl!==7) return; const user=allUsers.find(u=>u.nickname===nickname); let reason=null; if(!user.frozen) reason=prompt('Причина заморозки:'); if(!user.frozen && !reason) return; const res=await fetch('/api/toggleFreeze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname,reason})}); const result=await res.json(); if(result.success){ closeModal(); loadMembers(); } else alert(result.error); }
function deleteUser(nickname){ if(currentUser.lvl!==7) return; if(confirm(`Удалить ${nickname}?`)){ fetch('/api/deleteUser',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname})}).then(r=>r.json()).then(result=>{ if(result.success){ closeModal(); loadMembers(); }else alert(result.error); }); } }
function giveWarning(nickname){ if(currentUser.lvl<6) return; const text=prompt(`Выговор для ${nickname}\nТекст:`); if(text) socket.emit('send message',{ chat:'warnings', from:currentUser.nickname, text:`🔴 ВЫГОВОР для ${nickname}: ${text}`, lvl:currentUser.lvl, color:rankColors[currentUser.lvl] }); }
function closeModal(){ document.getElementById('modal').style.display='none'; }

document.getElementById('logoutBtn')?.addEventListener('click',()=> window.location.href='/logout');
document.getElementById('closeCallBtn')?.addEventListener('click', closeCallWindow);
document.getElementById('leaveCallBtn')?.addEventListener('click', closeCallWindow);
document.getElementById('toggleMicBtn')?.addEventListener('click', () => { if(localStream){ localStream.getAudioTracks().forEach(t=>{ t.enabled=!t.enabled; micEnabled=t.enabled; document.getElementById('toggleMicBtn').style.background=micEnabled?'#00ff88':'#ff3366'; }); } });
document.getElementById('toggleCamBtn')?.addEventListener('click', async () => { if(!localStream) return; camEnabled=!camEnabled; localStream.getVideoTracks().forEach(t=>t.enabled=camEnabled); document.getElementById('toggleCamBtn').style.background=camEnabled?'#00ff88':'#ff3366'; });
document.getElementById('shareScreenBtn')?.addEventListener('click', async () => { try{ const screenStream=await navigator.mediaDevices.getDisplayMedia({video:true}); const localVideo=document.getElementById('localVideo'); if(localVideo.srcObject){ localVideo.srcObject.getTracks().forEach(t=>t.stop()); } localVideo.srcObject=screenStream; screenStream.getVideoTracks()[0].onended=()=>{ if(localStream) localVideo.srcObject=localStream; }; } catch(e){} });

document.addEventListener('DOMContentLoaded', async ()=>{ await loadUser(); document.getElementById('addMemberBtn')?.addEventListener('click', openAddUserModal); document.querySelector('.modal-close')?.addEventListener('click', closeModal); window.onclick = e=>{ if(e.target === document.getElementById('modal')) closeModal(); }; switchChat('info_chat'); });
