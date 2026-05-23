let socket = io();
let currentUser = null;
let currentChat = 'info_chat';
let allUsers = [];
let complaintsCounter = 1;

const rankColors = { 1: '#ffffff', 2: '#00ff88', 3: '#00ccff', 4: '#aa66ff', 5: '#ffaa33', 6: '#ff3366', 7: '#111111' };
const rankNames = { 1: 'Гость', 2: 'Squad 545', 3: 'Трудовой состав', 4: 'Команда Ураган', 5: 'Модератор', 6: 'Администратор', 7: 'Владелец' };

// Хранилище выговоров для каждого пользователя
let userWarnings = {};

// КРАСИВЫЕ ПРАВИЛА
const rulesText = `
<div style="padding:10px">
    <h2 style="color:#ffdd00;text-align:center;margin-bottom:20px;">📜 ПРАВИЛА СООБЩЕСТВА 📜</h2>
    
    <div style="background:rgba(255,51,102,0.2);border-left:4px solid #ff3366;padding:12px;margin-bottom:20px;border-radius:8px;">
        <div style="color:#ffdd00;font-weight:bold;margin-bottom:8px;">❗️ ЗАПРЕЩАЕТСЯ:</div>
    </div>
    
    <div style="margin-bottom:20px;">
        <div style="display:grid;grid-template-columns:2fr 1fr;background:#ff3366;padding:8px 12px;border-radius:8px;margin-bottom:6px;font-weight:bold;color:white;">
            <span>🚫 НАРУШЕНИЕ</span><span>⚡ НАКАЗАНИЕ</span>
        </div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Унижения и оскорбления игроков</span><span style="color:#ffaa33;">1 Выговор / Предупреждение</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Отказ от защиты члена команды</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Флуд, боты, стикеры</span><span style="color:#ffaa33;">Мут 10мин / 1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Неуважение к участникам</span><span style="color:#ffaa33;">Мут 15мин / Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Превышение полномочий</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Ссылки без разрешения 6+ LVL</span><span style="color:#ffaa33;">Мут 30мин / Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Оскорбления игроков</span><span style="color:#ffaa33;">1 Выговор / Предупреждение</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Спам сообщений</span><span style="color:#ffaa33;">Мут 10-120мин / Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Оскорбление труда участников</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Неуместная критика</span><span style="color:#ffaa33;">Мут 24ч / 1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Споры и скандалы</span><span style="color:#ffaa33;">Мут 24ч / Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Упоминание прошлого</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Давать задания с пометкой -ОТПУСК-</span><span style="color:#ffaa33;">1 Выговор / Предупреждение</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Агрессия и неадекватное поведение</span><span style="color:#ffaa33;">1-2 Выговора</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Неуважение к старшему составу (6 LVL)</span><span style="color:#ff6666;">2 Выговора / Бан</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Срыв съёмок или стримов</span><span style="color:#ff6666;">2 Выговора / Бан</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Оскорбление родных</span><span style="color:#ff6666;">2 Выговора / Бан</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Оскорбление администрации и проектов</span><span style="color:#ff4444;">БАН</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Предательство</span><span style="color:#ff4444;">БАН</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Переманивание участников</span><span style="color:#ff4444;">БАН + ЧС</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Слив информации</span><span style="color:#ff4444;">БАН + ЧС</span></div>
    </div>
    
    <div style="background:rgba(255,68,68,0.2);border-left:4px solid #ff4444;padding:12px;margin-bottom:20px;border-radius:8px;">
        <div style="color:#ffdd00;font-weight:bold;margin-bottom:8px;">⚠️ ОСОБО ЗАПРЕЩАЕТСЯ:</div>
    </div>
    
    <div style="margin-bottom:20px;">
        <div style="display:grid;grid-template-columns:2fr 1fr;background:#ff4444;padding:8px 12px;border-radius:8px;margin-bottom:6px;font-weight:bold;color:white;">
            <span>🔗 НАРУШЕНИЕ</span><span>⚡ НАКАЗАНИЕ</span>
        </div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Разговоры о политике</span><span style="color:#ff4444;">Бан</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Контент 18+</span><span style="color:#ff4444;">Мут 7н / Бан</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Призывы к митингам, бунтам, рейдам</span><span style="color:#ff4444;">БАН + ЧС</span></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;padding:8px 12px;border-bottom:1px solid rgba(0,191,255,0.2);"><span>Нарушение УК РФ и СНГ</span><span style="color:#ff4444;">БАН + ЧС</span></div>
    </div>
</div>`;

// МЕНЮ (Выговоры исправлены)
const menuStructure = [
    { category: "⭐ Основное", minLvl: 1, items: [
        { id: "info", name: "📢 Информация", isParent: true, subitems: [
            { id: "members_list", name: "👥 Участники", action: "showMembers" },
            { id: "warnings_list", name: "⚠️ Выговоры", isChat: true },
            { id: "complaints", name: "📋 Жалобы", isChat: true },
            { id: "ideas", name: "💡 Идеи", isChat: true },
            { id: "tasks", name: "📌 Задачи", isChat: true },
            { id: "rules", name: "📜 Правила", isChat: true }
        ]},
        { id: "announcements", name: "📣 Объявление", isChat: true },
        { id: "calls_category", name: "📞 Звонки", isParent: true, subitems: [
            { id: "guest_call", name: "🎙️ Гостевой", minLvl: 1, isChat: true }
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

// НАЗВАНИЯ ЧАТОВ (русские)
const chatNames = {
    info_chat: '📢 Информация',
    announcements: '📣 Объявления',
    complaints: '📋 Жалобы',
    ideas: '💡 Идеи',
    tasks: '📌 Задачи',
    rules: '📜 Правила',
    warnings_list: '⚠️ Выговоры',
    squad545: '🟢 Squad 545',
    labor_general: '💬 Общий чат',
    editor: '✂️ Монтажёр',
    artist: '🎨 Художник',
    animator: '🎬 Аниматор',
    costumer: '👘 Костюмер',
    grinder: '⚙️ Нарешик',
    searcher: '🔍 Поисковик',
    builder: '🏗️ Билдер',
    coder: '💻 Кодер',
    hurricane: '🌀 Команда Ураган',
    moderators: '🛡️ Модераторы',
    admin_chat: '🔒 Админ. чат',
    guest_call: '🎙️ Гостевой'
};

// ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ
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
    loadWarnings();
    buildMenu();
}

function loadWarnings() {
    const saved = localStorage.getItem('userWarnings');
    if (saved) { userWarnings = JSON.parse(saved); }
}

function saveWarnings() {
    localStorage.setItem('userWarnings', JSON.stringify(userWarnings));
}

function addWarningToUser(nickname, reason) {
    if (!userWarnings[nickname]) { userWarnings[nickname] = []; }
    userWarnings[nickname].push({ reason: reason, date: new Date().toLocaleString(), giver: currentUser.nickname });
    saveWarnings();
}

function getWarningCount(nickname) {
    return userWarnings[nickname] ? userWarnings[nickname].length : 0;
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
                        else { subItem.innerHTML = `💬 ${sub.name}`; subItem.onclick = () => switchChat(sub.id); }
                        container.appendChild(subItem);
                    }
                }
            } else if (item.isChat) { mainItem.onclick = () => switchChat(item.id); container.appendChild(mainItem); }
        }
    }
}

function toggleSubmenu(parentId) { 
    localStorage.setItem(`menu_${parentId}`, localStorage.getItem(`menu_${parentId}`) === 'open' ? 'closed' : 'open'); 
    buildMenu(); 
}

// ПЕРЕКЛЮЧЕНИЕ ЧАТА
function switchChat(chatId) {
    currentChat = chatId; 
    buildMenu();
    
    document.getElementById('currentChatName').innerHTML = chatNames[chatId] || chatId;
    
    const inputArea = document.getElementById('chatInputArea');
    
    if (chatId === 'complaints') {
        inputArea.innerHTML = `<input type="text" id="messageInput" placeholder="Введите сообщение..." style="flex:1;padding:12px;background:#0a1e3a;border:1px solid #00bfff;border-radius:30px;color:#ffdd00"><button id="complaintBtn" style="padding:12px 24px;background:#ff3366;border:none;border-radius:30px;color:white;font-weight:bold">📋 Подать жалобу</button><button id="sendBtn" style="padding:12px 24px;background:#00bfff;border:none;border-radius:30px">📤</button>`;
        document.getElementById('complaintBtn')?.addEventListener('click', openComplaintModal);
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
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
        document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
    }
    
    document.getElementById('chatMessages').innerHTML = '<div class="welcome-message">Загрузка...</div>';
    if (chatId === 'rules') { 
        document.getElementById('chatMessages').innerHTML = rulesText; 
    } else { 
        socket.emit('join chat', chatId); 
    }
}

// ЖАЛОБЫ
function openComplaintModal() {
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody');
    const usersList = allUsers.map(u => `<option value="${u.nickname}">${u.nickname} (${u.name}) - ${rankNames[u.lvl]}</option>`).join('');
    const violations = [
        "Унижения и оскорбления", "Отказ от защиты", "Флуд", "Неуважение к участникам",
        "Превышение полномочий", "Ссылки без разрешения", "Оскорбления", "Спам",
        "Оскорбление труда", "Неуместная критика", "Споры и скандалы", "Агрессия",
        "Неуважение к старшим", "Срыв съёмок", "Оскорбление родных"
    ];
    modalBody.innerHTML = `
        <h3>📋 ЖАЛОБА №${complaintsCounter}</h3>
        <p style="color:#88aaff;font-size:12px;margin-bottom:15px;">Я подаю жалобу потому что мне что-то не нравится или информирую о нарушении, без корыстных целей.</p>
        
        <label>👤 Подающий жалобу (Ник):</label>
        <select id="complainantNick">${usersList}</select>
        
        <label>👤 На кого подаётся жалоба (Ник):</label>
        <select id="targetNick">${usersList}</select>
        
        <label>📝 Описание:</label>
        <textarea id="complaintDesc" rows="2" placeholder="Что произошло?"></textarea>
        
        <label>⚠️ Что нарушил:</label>
        <select id="violationSelect">
            <option value="">-- Выберите нарушение --</option>
            ${violations.map(v => `<option value="${v}">${v}</option>`).join('')}
            <option value="Другое">Другое (напишите в описании)</option>
        </select>
        
        <label>⚡ Какой вид наказания предлагаете:</label>
        <input id="punishment" placeholder="Выговор / Бан / Мут / Предупреждение">
        
        <button onclick="submitComplaint()" style="margin-top:15px;">📨 Отправить жалобу</button>
    `;
    
    const punishments = {
        "Унижения и оскорбления": "1 Выговор / Предупреждение",
        "Отказ от защиты": "1 Выговор",
        "Флуд": "Мут 10мин / 1 Выговор",
        "Неуважение к участникам": "Мут 15мин / Выговор",
        "Превышение полномочий": "1 Выговор",
        "Оскорбления": "1 Выговор / Предупреждение",
        "Спам": "Мут 10-120мин / Выговор",
        "Агрессия": "1-2 Выговора",
        "Неуважение к старшим": "2 Выговора / Бан",
        "Срыв съёмок": "2 Выговора / Бан",
        "Оскорбление родных": "2 Выговора / Бан"
    };
    document.getElementById('violationSelect')?.addEventListener('change', (e) => {
        if (punishments[e.target.value]) {
            document.getElementById('punishment').value = punishments[e.target.value];
        }
    });
    
    modal.style.display = 'block';
}

function submitComplaint() {
    const complainant = document.getElementById('complainantNick')?.value;
    const target = document.getElementById('targetNick')?.value;
    const desc = document.getElementById('complaintDesc')?.value;
    const violation = document.getElementById('violationSelect')?.value;
    const punishment = document.getElementById('punishment')?.value;
    
    if (!complainant || !target || !desc) { alert("Заполните все поля"); return; }
    
    const msg = `📋 ЖАЛОБА №${complaintsCounter}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ПОДАЮЩИЙ: ${complainant}\n` +
        `👤 НАРУШИТЕЛЬ: ${target}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📝 ОПИСАНИЕ: ${desc}\n` +
        `⚠️ НАРУШЕНИЕ: ${violation}\n` +
        `⚡ НАКАЗАНИЕ: ${punishment || "Не указано"}\n` +
        `📅 ДАТА: ${new Date().toLocaleString()}`;
    
    socket.emit('send message', { chat: 'complaints', from: currentUser.nickname, text: msg, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
    complaintsCounter++;
    closeModal();
    alert("✅ Жалоба отправлена!");
}

// СОКЕТЫ
socket.on('chat history', (messages) => {
    const container = document.getElementById('chatMessages'); 
    container.innerHTML = '';
    if (!messages || messages.length === 0) { 
        container.innerHTML = '<div class="welcome-message">✨ Сообщений пока нет.</div>'; 
        return; 
    }
    messages.forEach(msg => addMessageToChat(msg));
});

socket.on('new message', (msg) => addMessageToChat(msg));

function addMessageToChat(msg) {
    const container = document.getElementById('chatMessages');
    const isOwn = msg.from === currentUser.nickname;
    const msgDiv = document.createElement('div'); 
    msgDiv.className = `message ${isOwn ? 'own' : ''}`;
    msgDiv.innerHTML = `<div class="message-header"><span class="message-rank" style="background:${msg.color || '#333'}">${msg.lvl} LVL</span><span class="message-from">${escapeHtml(msg.from)}</span><span class="message-time">${msg.time}</span></div><div class="message-text" style="white-space:pre-wrap;">${escapeHtml(msg.text)}</div>`;
    container.appendChild(msgDiv); 
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput'); 
    if (!input) return;
    const text = input.value.trim(); 
    if (!text) return;
    if (currentChat === 'rules' && currentUser.lvl !== 7) { 
        alert("Только LVL 7 может писать в правила"); 
        return; 
    }
    socket.emit('send message', { chat: currentChat, from: currentUser.nickname, text: text, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
    input.value = '';
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); 
}

// УЧАСТНИКИ (просмотр для всех, редактирование только для LVL7)
function showMembersPanel() {
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody');
    const sorted = [...allUsers].sort((a, b) => b.lvl - a.lvl);
    modalBody.innerHTML = `<h3>👥 Все участники</h3><div style="max-height:400px;overflow-y:auto;">${sorted.map(user => `
        <div style="padding:10px;border-bottom:1px solid rgba(0,191,255,0.2);display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="openUserModal('${user.nickname}')">
            <div style="width:36px;height:36px;border-radius:10px;background:${rankColors[user.lvl]};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">${user.lvl}</div>
            <div><div style="color:#ffdd00;font-weight:bold;">${escapeHtml(user.nickname)}</div><div style="color:#00bfff;font-size:11px;">${rankNames[user.lvl]} ${user.subRole ? '· ' + user.subRole : ''}</div><div style="color:#ffaa33;font-size:10px;">⚠️ Выговоры: ${getWarningCount(user.nickname)}/3</div></div>
        </div>`).join('')}</div>`;
    modal.style.display = 'block';
}

function openUserModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname); 
    if (!user) return;
    
    // РАСЧЁТ СТАЖА
    const joinDate = new Date(user.joinDate); 
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear(); 
    let months = now.getMonth() - joinDate.getMonth();
    if (months < 0) { years--; months += 12; }
    let exp = years > 0 ? `${years} год${years > 1 ? 'а' : ''} ${months > 0 ? months + ' мес.' : ''}` : months > 0 ? `${months} месяц${months > 1 ? 'а' : ''}` : '< 1 мес.';
    
    const warningsList = userWarnings[nickname] || [];
    const warningsHtml = warningsList.length > 0 ? 
        `<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
            <strong style="color:#ffaa33;">⚠️ Выговоры (${warningsList.length}/3):</strong>
            ${warningsList.map(w => `<div style="font-size:12px;margin-top:5px;border-bottom:1px solid rgba(0,191,255,0.2);padding:5px;">📅 ${w.date}<br>📝 ${escapeHtml(w.reason)}<br>👮 Выдал: ${w.giver}</div>`).join('')}
        </div>` : '<div style="margin-top:10px;color:#88aaff;">⚠️ Выговоров нет</div>';
    
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>👤 ${escapeHtml(user.nickname)}</h3>
        <div style="text-align:center;margin:15px 0;">
            <span style="display:inline-block;padding:6px 20px;background:${rankColors[user.lvl]};border-radius:30px;color:white;font-weight:bold;text-shadow:0 0 2px black;">${user.lvl} LVL · ${rankNames[user.lvl]}</span>
            ${user.subRole ? `<div style="margin-top:8px;">📌 Подроль: ${escapeHtml(user.subRole)}</div>` : ''}
            <div style="margin-top:5px;color:#ffaa33;">⚠️ Выговоры: ${warningsList.length}/3</div>
        </div>
        <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(user.nickname)}</span></p>
        <p><strong>👤 Имя:</strong> <span style="color:#ffdd00;">${escapeHtml(user.name)}</span></p>
        <p><strong>🎂 Дата рождения:</strong> ${user.birthDate || '—'}</p>
        <p><strong>📅 Дата вступления:</strong> ${user.joinDate} → <span style="color:#ffdd00;">${exp}</span></p>
        <p><strong>📝 Комментарий:</strong> ${user.comment || '—'}</p>
        ${user.frozen ? `<p><strong>❄️ Заморожен:</strong> ${user.frozenReason || 'Без причины'}</p>` : ''}
        ${warningsHtml}
        <div class="user-actions-modal">
            ${currentUser.lvl === 7 ? `
                <button class="user-action-btn edit" onclick="editUser('${user.nickname}')">✏️ Редактировать</button>
                <button class="user-action-btn warn" onclick="giveWarningWithReason('${user.nickname}')">📝 Выдать выговор</button>
                <button class="user-action-btn freeze" onclick="toggleFreeze('${user.nickname}')">${user.frozen ? '❄️ Разморозить' : '🔥 Заморозить'}</button>
                ${user.nickname !== 'STORM_X' ? `<button class="user-action-btn delete" onclick="deleteUser('${user.nickname}')">❌ Удалить</button>` : ''}
            ` : '<p style="color:#888;">👁️ Только просмотр</p>'}
        </div>
    `;
    modal.style.display = 'block';
}

// ВЫГОВОР (с сохранением)
function giveWarningWithReason(nickname) {
    if (currentUser.lvl < 6) return;
    const reason = prompt(`Выговор для ${nickname}\nВведите причину выговора:`);
    if (!reason) return;
    
    const warningCount = getWarningCount(nickname) + 1;
    addWarningToUser(nickname, reason);
    
    socket.emit('send message', { 
        chat: 'warnings_list', 
        from: currentUser.nickname, 
        text: `🔴 ВЫГОВОР №${warningCount} для ${nickname}\n📝 Причина: ${reason}\n👮 Выдал: ${currentUser.nickname}\n📅 Дата: ${new Date().toLocaleString()}`,
        lvl: currentUser.lvl, 
        color: rankColors[currentUser.lvl] 
    });
    
    alert(`✅ Выговор выдан ${nickname} (${warningCount}/3)`);
    closeModal();
}

// АДМИН ФУНКЦИИ
async function loadMembers() { 
    const res = await fetch('/api/users'); 
    const data = await res.json(); 
    if (!data.error) { allUsers = data; renderMembersList(); } 
}

function renderMembersList() { 
    const container = document.getElementById('membersList'); 
    if (!container) return; 
    const sorted = [...allUsers].sort((a, b) => b.lvl - a.lvl); 
    container.innerHTML = sorted.map(user => `
        <div class="member-item" data-nickname="${user.nickname}">
            <div class="member-rank-badge" style="background:${rankColors[user.lvl]}">${user.lvl} LVL</div>
            <div class="member-info">
                <div class="member-nick">${escapeHtml(user.nickname)}</div>
                <div class="member-name">${escapeHtml(user.name)}</div>
                <div class="member-role">${rankNames[user.lvl]}${user.subRole ? ` · ${user.subRole}` : ''}</div>
                <div class="member-role" style="color:#ffaa33;">⚠️ ${getWarningCount(user.nickname)}/3</div>
            </div>
            ${user.frozen ? '<div class="frozen-badge">❄️</div>' : ''}
        </div>`).join(''); 
    document.querySelectorAll('.member-item').forEach(el => el.addEventListener('click', () => openUserModal(el.dataset.nickname))); 
}

function openAddUserModal() { 
    if (currentUser.lvl !== 7) return; 
    const modal = document.getElementById('modal'); 
    modal.innerHTML = `<div class="modal-content"><span class="modal-close">&times;</span><div id="modalBody"><h3>➕ Добавить участника</h3><label>Ник (логин):</label><input id="addNickname"><label>Имя:</label><input id="addName"><label>Пароль:</label><input id="addPassword" type="text"><label>Ранг:</label><select id="addLvl"><option value="1">Гость</option><option value="2">Squad 545</option><option value="3">Трудовой состав</option><option value="4">Ураган</option><option value="5">Модератор</option><option value="6">Администратор</option></select><label>Подроль:</label><input id="addSubRole" placeholder="Монтажёр, Художник..."><label>Дата рождения:</label><input id="addBirthDate" placeholder="ДД.ММ.ГГГГ"><label>Комментарий:</label><textarea id="addComment" rows="2"></textarea><label>📅 Дата вступления (оставьте пустым для автоматической):</label><input id="addJoinDate" placeholder="ДД.ММ.ГГГГ"><button onclick="submitAddUser()">✅ Добавить</button></div></div>`; 
    modal.style.display = 'block'; 
    document.querySelector('.modal-close').onclick = closeModal; 
}

async function submitAddUser() { 
    let joinDate = document.getElementById('addJoinDate').value;
    if (!joinDate) { joinDate = new Date().toLocaleDateString(); }
    
    const data = { 
        nickname: document.getElementById('addNickname').value, 
        name: document.getElementById('addName').value, 
        password: document.getElementById('addPassword').value, 
        lvl: document.getElementById('addLvl').value, 
        subRole: document.getElementById('addSubRole').value, 
        birthDate: document.getElementById('addBirthDate').value, 
        comment: document.getElementById('addComment').value,
        joinDate: joinDate
    }; 
    const res = await fetch('/api/addUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); buildMenu(); } 
    else alert(result.error); 
}

function editUser(nickname) { 
    if (currentUser.lvl !== 7) return; 
    const user = allUsers.find(u => u.nickname === nickname); 
    const modalBody = document.getElementById('modalBody'); 
    modalBody.innerHTML = `<h3>✏️ Редактировать ${nickname}</h3><label>Имя:</label><input id="editName" value="${user.name}"><label>Ранг:</label><select id="editLvl">${[1, 2, 3, 4, 5, 6, 7].map(l => `<option value="${l}" ${user.lvl === l ? 'selected' : ''}>${rankNames[l]}</option>`).join('')}</select><label>Подроль:</label><input id="editSubRole" value="${user.subRole || ''}"><label>Дата рождения:</label><input id="editBirthDate" value="${user.birthDate || ''}"><label>Комментарий:</label><textarea id="editComment" rows="2">${user.comment || ''}</textarea><label>Дата вступления:</label><input id="editJoinDate" value="${user.joinDate}"><button onclick="submitEditUser('${nickname}')">💾 Сохранить</button>`; 
}

async function submitEditUser(nickname) { 
    const data = { 
        nickname, 
        name: document.getElementById('editName').value, 
        lvl: document.getElementById('editLvl').value, 
        subRole: document.getElementById('editSubRole').value, 
        birthDate: document.getElementById('editBirthDate').value, 
        comment: document.getElementById('editComment').value,
        joinDate: document.getElementById('editJoinDate').value
    }; 
    const res = await fetch('/api/editUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); buildMenu(); } 
    else alert(result.error); 
}

async function toggleFreeze(nickname) { 
    if (currentUser.lvl !== 7) return; 
    const user = allUsers.find(u => u.nickname === nickname); 
    let reason = null; 
    if (!user.frozen) reason = prompt('Причина заморозки:\n- Аккаунт в "Отпуске"\n- Аккаунт взломан\n- Странные активности', 'Аккаунт в "Отпуске"'); 
    if (!user.frozen && !reason) return; 
    const res = await fetch('/api/toggleFreeze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname, reason }) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); } 
    else alert(result.error); 
}

function deleteUser(nickname) { 
    if (currentUser.lvl !== 7) return; 
    if (confirm(`Удалить ${nickname}?`)) { 
        fetch('/api/deleteUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname }) })
            .then(r => r.json()).then(result => { if (result.success) { closeModal(); loadMembers(); } else alert(result.error); }); 
    } 
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// ЗАПУСК
document.getElementById('logoutBtn')?.addEventListener('click', () => window.location.href = '/logout');
document.addEventListener('DOMContentLoaded', async () => { 
    await loadUser(); 
    document.getElementById('addMemberBtn')?.addEventListener('click', openAddUserModal); 
    document.querySelector('.modal-close')?.addEventListener('click', closeModal); 
    window.onclick = e => { if (e.target === document.getElementById('modal')) closeModal(); }; 
    switchChat('info_chat'); 
});
