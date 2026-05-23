let socket = io();
let currentUser = null;
let currentChat = 'info_chat';
let allUsers = [];
let complaintsCounter = 1;

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

// Хранилище выговоров
let userWarnings = {};

// ПРАВИЛА - ПОЛНЫЙ ТЕКСТ С БЕЛЫМИ БУКВАМИ
const rulesText = `<div style="padding:10px; color:#ffffff; text-shadow: 0 0 2px black, 0 0 2px black, 0 0 2px black;">
    <h2 style="color:#ffdd00; text-align:center; margin-bottom:20px; text-shadow: 0 0 3px black;">📜 ПРАВИЛА СООБЩЕСТВА 📜</h2>
    
    <div style="background:rgba(255,51,102,0.3); border-left:4px solid #ff3366; padding:12px; margin-bottom:20px; border-radius:8px;">
        <div style="color:#ffdd00; font-weight:bold; margin-bottom:8px; text-shadow: 0 0 2px black;">❗️ ЗАПРЕЩАЕТСЯ:</div>
    </div>
    
    <div style="margin-bottom:20px;">
        <div style="display:grid; grid-template-columns:2fr 1fr; background:#ff3366; padding:8px 12px; border-radius:8px; margin-bottom:6px; font-weight:bold; color:white; text-shadow: 0 0 1px black;">
            <span>🚫 НАРУШЕНИЕ</span><span>⚡ НАКАЗАНИЕ</span>
        </div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Унижения и оскорбления игроков за ту или иную причину</span><span style="color:#ffaa33;">1 Выговор / Устное предупреждение</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Отказ от защиты члена команды в случае его унижения</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Флуд сообщениями, ботами, стикерами</span><span style="color:#ffaa33;">Мут 10мин / 1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Неуважительное отношение к участникам команды</span><span style="color:#ffaa33;">Мут 15мин / Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Превышение своих полномочий</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Ссылки без разрешения 6+ LVL</span><span style="color:#ffaa33;">Мут 30мин / 1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Оскорбления игроков</span><span style="color:#ffaa33;">1 Выговор / Устное предупреждение</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Спам сообщений</span><span style="color:#ffaa33;">Мут 10-120мин / 1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Оскорбление труда участников (видео, арты и т.д.)</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Неуместная критика</span><span style="color:#ffaa33;">Мут 24ч / 1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Споры и скандалы</span><span style="color:#ffaa33;">Мут 24ч / 1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Упоминание прошлого (плохих людей и действий)</span><span style="color:#ffaa33;">1 Выговор</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Давать задания участникам с пометкой -ОТПУСК-</span><span style="color:#ffaa33;">1 Выговор / Устное предупреждение</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Агрессия и неадекватное поведение</span><span style="color:#ffaa33;">1-2 Выговора</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Неуважительное отношение к старшему составу (6 LVL)</span><span style="color:#ff6666;">2 Выговора / Временный бан</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Срыв съёмок или стримов</span><span style="color:#ff6666;">2 Выговора / Бан</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Оскорбление родных</span><span style="color:#ff6666;">2 Выговора / Временный бан</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Оскорбление администрации и проектов</span><span style="color:#ff4444;">БАН</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Предательство</span><span style="color:#ff4444;">БАН</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Переманивание участников на свои проекты</span><span style="color:#ff4444;">БАН + ЧС везде</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Слив информации</span><span style="color:#ff4444;">БАН + ЧС везде</span></div>
    </div>
    
    <div style="background:rgba(255,68,68,0.3); border-left:4px solid #ff4444; padding:12px; margin-bottom:20px; border-radius:8px;">
        <div style="color:#ffdd00; font-weight:bold; margin-bottom:8px; text-shadow: 0 0 2px black;">⚠️ ОСОБО ЗАПРЕЩАЕТСЯ:</div>
    </div>
    
    <div style="margin-bottom:20px;">
        <div style="display:grid; grid-template-columns:2fr 1fr; background:#ff4444; padding:8px 12px; border-radius:8px; margin-bottom:6px; font-weight:bold; color:white; text-shadow: 0 0 1px black;">
            <span>🔗 НАРУШЕНИЕ</span><span>⚡ НАКАЗАНИЕ</span>
        </div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Разговоры о политике</span><span style="color:#ff4444;">Временный бан / Бан</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Контент с ограничением по возрасту (18+)</span><span style="color:#ff4444;">Мут 7н / Бан</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Призывы к митингам, бунтам, рейдам</span><span style="color:#ff4444;">БАН + ЧС везде</span></div>
        <div style="display:grid; grid-template-columns:2fr 1fr; padding:8px 12px; border-bottom:1px solid rgba(0,191,255,0.3); color:#ffffff; text-shadow: 0 0 1px black;"><span>Нарушение УК РФ и законодательства СНГ</span><span style="color:#ff4444;">БАН + ЧС везде</span></div>
    </div>
</div>`;

// СТРУКТУРА МЕНЮ
const menuStructure = [
    { 
        category: "⭐ Основное", 
        minLvl: 1, 
        items: [
            { 
                id: "info", 
                name: "📢 Информация", 
                isParent: true, 
                subitems: [
                    { id: "members_list", name: "👥 Участники", action: "showMembers" },
                    { id: "warnings_list", name: "⚠️ Выговоры", isChat: true },
                    { id: "complaints", name: "📋 Жалобы", isChat: true },
                    { id: "ideas", name: "💡 Идеи", isChat: true },
                    { id: "tasks", name: "📌 Задачи", isChat: true },
                    { id: "rules", name: "📜 Правила", isChat: true }
                ]
            },
            { id: "announcements", name: "📣 Объявление", isChat: true },
            { 
                id: "calls_category", 
                name: "📞 Звонки", 
                isParent: true, 
                subitems: [
                    { id: "guest_call", name: "🎙️ Гостевой", minLvl: 1, isChat: true }
                ]
            }
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
            { 
                id: "labor_category", 
                name: "🔧 Трудовой состав", 
                isParent: true, 
                subitems: [
                    { id: "labor_general", name: "💬 Общий чат", minLvl: 3, isChat: true },
                    { id: "editor", name: "✂️ Монтажёр", roleRequired: "Монтажёр", isChat: true },
                    { id: "artist", name: "🎨 Художник", roleRequired: "Художник", isChat: true },
                    { id: "animator", name: "🎬 Аниматор", roleRequired: "Аниматор", isChat: true },
                    { id: "costumer", name: "👘 Костюмер", roleRequired: "Костюмер", isChat: true },
                    { id: "grinder", name: "⚙️ Нарешик", roleRequired: "Нарешик", isChat: true },
                    { id: "searcher", name: "🔍 Поисковик", roleRequired: "Поисковик", isChat: true },
                    { id: "builder", name: "🏗️ Билдер", roleRequired: "Билдер", isChat: true },
                    { id: "coder", name: "💻 Кодер", roleRequired: "Кодер", isChat: true }
                ]
            }
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

// НАЗВАНИЯ ЧАТОВ
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

// ===== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ =====
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
        
        loadWarnings();
        buildMenu();
    } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
        window.location.href = '/login.html';
    }
}

// ===== ВЫГОВОРЫ =====
function loadWarnings() { 
    const saved = localStorage.getItem('userWarnings'); 
    if (saved) { 
        userWarnings = JSON.parse(saved); 
    } else {
        userWarnings = {};
    }
}

function saveWarnings() { 
    localStorage.setItem('userWarnings', JSON.stringify(userWarnings)); 
}

function addWarningToUser(nickname, reason) { 
    if (!userWarnings[nickname]) { 
        userWarnings[nickname] = []; 
    }
    userWarnings[nickname].push({ 
        reason: reason, 
        date: new Date().toLocaleString(), 
        giver: currentUser.nickname 
    }); 
    saveWarnings(); 
}

function getWarningCount(nickname) { 
    return userWarnings[nickname] ? userWarnings[nickname].length : 0; 
}

// ===== ПОСТРОЕНИЕ МЕНЮ =====
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
            let access = true;
            if (item.minLvl && currentUser.lvl < item.minLvl) access = false;
            if (item.roleRequired && currentUser.subRole !== item.roleRequired && currentUser.lvl < 6) access = false;
            if (!access) continue;
            
            const mainItem = document.createElement('div'); 
            mainItem.className = `chat-item ${currentChat === item.id ? 'active' : ''}`;
            mainItem.innerHTML = `<span class="chat-icon">${item.name.charAt(0)}</span><span class="chat-name">${item.name}</span>`;
            
            if (item.isParent) {
                let isOpen = localStorage.getItem(`menu_${item.id}`) === 'open';
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
                        
                        if (sub.action === 'showMembers') { 
                            subItem.innerHTML = `👥 ${sub.name}`; 
                            subItem.onclick = () => showMembersPanel(); 
                        } else { 
                            subItem.innerHTML = `💬 ${sub.name}`; 
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
    const currentState = localStorage.getItem(`menu_${parentId}`);
    if (currentState === 'open') {
        localStorage.setItem(`menu_${parentId}`, 'closed');
    } else {
        localStorage.setItem(`menu_${parentId}`, 'open');
    }
    buildMenu(); 
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЧАТА =====
function switchChat(chatId) {
    currentChat = chatId; 
    buildMenu();
    
    document.getElementById('currentChatName').innerHTML = chatNames[chatId] || chatId;
    
    const inputArea = document.getElementById('chatInputArea');
    
    if (chatId === 'complaints') {
        inputArea.innerHTML = `
            <input type="text" id="messageInput" placeholder="Введите сообщение..." style="flex:1;padding:12px;background:#0a1e3a;border:1px solid #00bfff;border-radius:30px;color:#ffdd00">
            <button id="complaintBtn" style="padding:12px 24px;background:#ff3366;border:none;border-radius:30px;color:white;font-weight:bold">📋 Подать жалобу</button>
            <button id="sendBtn" style="padding:12px 24px;background:#00bfff;border:none;border-radius:30px">📤</button>
        `;
        document.getElementById('complaintBtn')?.addEventListener('click', openComplaintModal);
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
    } 
    else if (chatId === 'rules') {
        if (currentUser.lvl === 7) {
            inputArea.innerHTML = `
                <div style="width:100%;display:flex;gap:10px;">
                    <button id="editRulesBtn" style="padding:12px 24px;background:#ffdd00;color:#000;border:none;border-radius:30px;font-weight:bold;">✏️ Редактировать правила</button>
                    <button id="saveRulesBtn" style="display:none;padding:12px 24px;background:#00ff88;color:#000;border:none;border-radius:30px;font-weight:bold;">💾 Сохранить</button>
                </div>
            `;
            document.getElementById('editRulesBtn')?.addEventListener('click', () => {
                const msgDiv = document.getElementById('chatMessages');
                const currentText = msgDiv.innerText;
                msgDiv.innerHTML = `<textarea id="rulesEditor" style="width:100%;height:400px;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;padding:15px;border-radius:15px;font-size:14px;">${currentText}</textarea>`;
                document.getElementById('editRulesBtn').style.display = 'none';
                document.getElementById('saveRulesBtn').style.display = 'block';
            });
            document.getElementById('saveRulesBtn')?.addEventListener('click', () => {
                const newText = document.getElementById('rulesEditor').value;
                socket.emit('send message', { 
                    chat: 'rules', 
                    from: currentUser.nickname, 
                    text: newText, 
                    lvl: currentUser.lvl, 
                    color: rankColors[currentUser.lvl] 
                });
                document.getElementById('editRulesBtn').style.display = 'block';
                document.getElementById('saveRulesBtn').style.display = 'none';
                switchChat('rules');
            });
        } else {
            inputArea.innerHTML = `<div style="width:100%;text-align:center;color:#888;padding:10px">🔒 Чат только для чтения</div>`;
        }
    } 
    else {
        inputArea.innerHTML = `
            <input type="text" id="messageInput" placeholder="Введите сообщение..." style="flex:1;padding:12px;background:#0a1e3a;border:1px solid #00bfff;border-radius:30px;color:#ffdd00">
            <button id="sendBtn" style="padding:12px 24px;background:#00bfff;border:none;border-radius:30px">📤</button>
        `;
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

// ===== ЖАЛОБЫ =====
function openComplaintModal() {
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody');
    
    const usersList = allUsers.map(u => `<option value="${u.nickname}">${u.nickname} (${u.name}) - ${rankNames[u.lvl]}</option>`).join('');
    
    const violations = [
        "Унижения и оскорбления", 
        "Отказ от защиты", 
        "Флуд", 
        "Неуважение к участникам",
        "Превышение полномочий", 
        "Ссылки без разрешения", 
        "Оскорбления", 
        "Спам",
        "Оскорбление труда", 
        "Неуместная критика", 
        "Споры и скандалы", 
        "Агрессия",
        "Неуважение к старшим", 
        "Срыв съёмок", 
        "Оскорбление родных"
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
    
    if (!complainant || !target || !desc) { 
        alert("Заполните все поля"); 
        return; 
    }
    
    const msg = `📋 ЖАЛОБА №${complaintsCounter}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ПОДАЮЩИЙ: ${complainant}\n` +
        `👤 НАРУШИТЕЛЬ: ${target}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📝 ОПИСАНИЕ: ${desc}\n` +
        `⚠️ НАРУШЕНИЕ: ${violation}\n` +
        `⚡ НАКАЗАНИЕ: ${punishment || "Не указано"}\n` +
        `📅 ДАТА: ${new Date().toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    socket.emit('send message', { 
        chat: 'complaints', 
        from: currentUser.nickname, 
        text: msg, 
        lvl: currentUser.lvl, 
        color: rankColors[currentUser.lvl] 
    });
    
    complaintsCounter++;
    closeModal();
    alert("✅ Жалоба отправлена!");
}

// ===== СОКЕТЫ =====
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
    msgDiv.innerHTML = `
        <div class="message-header">
            <span class="message-rank" style="background:${msg.color || '#333'}">${msg.lvl} LVL</span>
            <span class="message-from">${escapeHtml(msg.from)}</span>
            <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-text" style="white-space:pre-wrap;">${escapeHtml(msg.text)}</div>
    `; 
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
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); 
}

// ===== ФУНКЦИЯ ДЛЯ ВЫДАЧИ НАКАЗАНИЙ =====
function openPunishModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const warningsReasons = [
        "Унижения и оскорбления игроков",
        "Отказ от защиты члена команды",
        "Флуд, боты, стикеры",
        "Неуважение к участникам",
        "Превышение полномочий",
        "Ссылки без разрешения",
        "Оскорбления игроков",
        "Спам сообщений",
        "Оскорбление труда участников",
        "Неуместная критика",
        "Споры и скандалы",
        "Упоминание прошлого",
        "Агрессия и неадекватное поведение",
        "Неуважение к старшему составу"
    ];
    
    const banReasons = [
        "Неуважение к старшему составу (2 выговора)",
        "Срыв съёмок или стримов",
        "Оскорбление родных",
        "Оскорбление администрации и проектов",
        "Предательство",
        "Переманивание участников",
        "Слив информации",
        "Разговоры о политике",
        "Контент 18+",
        "Призывы к митингам, бунтам, рейдам",
        "Нарушение УК РФ и СНГ"
    ];
    
    const muteReasons = [
        "Флуд сообщениями",
        "Спам",
        "Оскорбления",
        "Неуместная критика",
        "Споры и скандалы",
        "Ссылки без разрешения"
    ];
    
    const currentWarnings = getWarningCount(nickname);
    
    modalBody.innerHTML = `
        <h3>⚖️ Выдать наказание для ${escapeHtml(nickname)}</h3>
        <div style="text-align:center;margin:15px 0;">
            <span style="display:inline-block;padding:6px 20px;background:${rankColors[user.lvl]};border-radius:30px;color:white;font-weight:bold;text-shadow:0 0 2px black;">${user.lvl} LVL · ${rankNames[user.lvl]}</span>
            ${user.subRole ? `<div style="margin-top:8px;">📌 Должность: ${escapeHtml(user.subRole)}</div>` : ''}
            <div style="margin-top:5px;color:#ffaa33;">⚠️ Текущие выговоры: ${currentWarnings}/3</div>
        </div>
        
        <label>📋 Выберите тип наказания:</label>
        <select id="punishType" style="width:100%; padding:12px; margin-bottom:20px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
            <option value="warning">📝 Устное предупреждение</option>
            <option value="strike">🔴 Выговор</option>
            <option value="ban">🚫 Бан</option>
            <option value="mute">🔇 Мут</option>
        </select>
        
        <div id="punishForm"></div>
        
        <button onclick="submitPunish('${nickname}')" style="width:100%; margin-top:20px;">✅ Отправить наказание</button>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('punishType').addEventListener('change', (e) => {
        updatePunishForm(e.target.value, nickname, user, currentWarnings, warningsReasons, banReasons, muteReasons);
    });
    
    updatePunishForm('warning', nickname, user, currentWarnings, warningsReasons, banReasons, muteReasons);
}

function updatePunishForm(type, nickname, user, currentWarnings, warningsReasons, banReasons, muteReasons) {
    const container = document.getElementById('punishForm');
    const adminRank = `${currentUser.lvl} LVL · ${rankNames[currentUser.lvl]}${currentUser.subRole ? ` · ${currentUser.subRole}` : ''}`;
    
    if (type === 'warning') {
        container.innerHTML = `
            <div style="background:rgba(0,100,0,0.3); padding:15px; border-radius:14px; margin-bottom:15px;">
                <div style="color:#ffdd00; font-weight:bold; margin-bottom:10px;">📝 УСТНОЕ ПРЕДУПРЕЖДЕНИЕ</div>
                <p><strong>👮 Где состоит (Администрация):</strong> ${adminRank}</p>
                <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(nickname)}</span></p>
                <p><strong>⭐ Ранг:</strong> ${user.lvl} LVL · ${rankNames[user.lvl]}</p>
                <p><strong>📌 Должность:</strong> ${user.subRole || '—'}</p>
                <label>📝 Причина:</label>
                <textarea id="punishReason" rows="2" style="width:100%; padding:10px; background:#0a1e3a; border:1px solid #00bfff; border-radius:10px; color:#ffdd00;"></textarea>
            </div>
        `;
    } 
    else if (type === 'strike') {
        container.innerHTML = `
            <div style="background:rgba(255,51,102,0.2); padding:15px; border-radius:14px; margin-bottom:15px;">
                <div style="color:#ffdd00; font-weight:bold; margin-bottom:10px;">🔴 ВЫГОВОР</div>
                <p><strong>👮 Где состоит (Администрация):</strong> ${adminRank}</p>
                <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(nickname)}</span></p>
                <p><strong>⭐ Ранг:</strong> ${user.lvl} LVL · ${rankNames[user.lvl]}</p>
                <p><strong>📌 Должность:</strong> ${user.subRole || '—'}</p>
                <p><strong>⚠️ Сумма выговоров на данный момент:</strong> ${currentWarnings}/3</p>
                <label>📝 Выберите причину выговора:</label>
                <select id="punishReason" style="width:100%; padding:12px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
                    <option value="">-- Выберите причину --</option>
                    ${warningsReasons.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
            </div>
        `;
    } 
    else if (type === 'ban') {
        container.innerHTML = `
            <div style="background:rgba(255,68,68,0.2); padding:15px; border-radius:14px; margin-bottom:15px;">
                <div style="color:#ffdd00; font-weight:bold; margin-bottom:10px;">🚫 БАН</div>
                <p><strong>👮 Где состоит (Администрация):</strong> ${adminRank}</p>
                <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(nickname)}</span></p>
                <p><strong>⭐ Ранг:</strong> ${user.lvl} LVL · ${rankNames[user.lvl]}</p>
                <p><strong>📌 Должность:</strong> ${user.subRole || '—'}</p>
                <p><strong>⚠️ Сумма выговоров на данный момент:</strong> ${currentWarnings}/3</p>
                <label>📝 Выберите причину бана:</label>
                <select id="banReasonSelect" style="width:100%; padding:12px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
                    <option value="">-- Выберите причину --</option>
                    ${banReasons.map(r => `<option value="${r}">${r}</option>`).join('')}
                    <option value="Другое">Другое (напишите ниже)</option>
                </select>
                <label style="margin-top:10px;">📝 Или напишите причину сами:</label>
                <textarea id="punishReason" rows="2" style="width:100%; padding:10px; background:#0a1e3a; border:1px solid #00bfff; border-radius:10px; color:#ffdd00;" placeholder="Введите причину бана..."></textarea>
                <label style="margin-top:10px;">⏰ Срок бана:</label>
                <select id="banDuration" style="width:100%; padding:12px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
                    <option value="1 день">1 день</option>
                    <option value="3 дня">3 дня</option>
                    <option value="7 дней">7 дней</option>
                    <option value="14 дней">14 дней</option>
                    <option value="30 дней">30 дней</option>
                    <option value="Навсегда">Навсегда</option>
                </select>
            </div>
        `;
        
        document.getElementById('banReasonSelect')?.addEventListener('change', (e) => {
            if (e.target.value !== 'Другое') {
                document.getElementById('punishReason').value = e.target.value;
            }
        });
    } 
    else if (type === 'mute') {
        container.innerHTML = `
            <div style="background:rgba(255,153,51,0.2); padding:15px; border-radius:14px; margin-bottom:15px;">
                <div style="color:#ffdd00; font-weight:bold; margin-bottom:10px;">🔇 МУТ</div>
                <p><strong>👮 Где состоит (Администрация):</strong> ${adminRank}</p>
                <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;">${escapeHtml(nickname)}</span></p>
                <p><strong>⭐ Ранг:</strong> ${user.lvl} LVL · ${rankNames[user.lvl]}</p>
                <p><strong>📌 Должность:</strong> ${user.subRole || '—'}</p>
                <label>📝 Выберите причину мута:</label>
                <select id="muteReasonSelect" style="width:100%; padding:12px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
                    <option value="">-- Выберите причину --</option>
                    ${muteReasons.map(r => `<option value="${r}">${r}</option>`).join('')}
                    <option value="Другое">Другое (напишите ниже)</option>
                </select>
                <label style="margin-top:10px;">📝 Или напишите причину сами:</label>
                <textarea id="punishReason" rows="2" style="width:100%; padding:10px; background:#0a1e3a; border:1px solid #00bfff; border-radius:10px; color:#ffdd00;" placeholder="Введите причину мута..."></textarea>
                <label style="margin-top:10px;">⏰ Время мута:</label>
                <select id="muteDuration" style="width:100%; padding:12px; background:#0a1e3a; border:1px solid #00bfff; border-radius:14px; color:#ffdd00;">
                    <option value="10 минут">10 минут</option>
                    <option value="30 минут">30 минут</option>
                    <option value="1 час">1 час</option>
                    <option value="3 часа">3 часа</option>
                    <option value="6 часов">6 часов</option>
                    <option value="12 часов">12 часов</option>
                    <option value="1 день">1 день</option>
                    <option value="7 дней">7 дней</option>
                </select>
            </div>
        `;
        
        document.getElementById('muteReasonSelect')?.addEventListener('change', (e) => {
            if (e.target.value !== 'Другое') {
                document.getElementById('punishReason').value = e.target.value;
            }
        });
    }
}

function submitPunish(nickname) {
    const punishType = document.getElementById('punishType').value;
    let reason = document.getElementById('punishReason')?.value || '';
    let duration = '';
    let typeName = '';
    
    if (punishType === 'warning') {
        typeName = '📝 УСТНОЕ ПРЕДУПРЕЖДЕНИЕ';
        if (!reason) { alert("Введите причину предупреждения"); return; }
    } 
    else if (punishType === 'strike') {
        typeName = '🔴 ВЫГОВОР';
        if (!reason) { alert("Выберите причину выговора"); return; }
        
        const currentWarnings = getWarningCount(nickname) + 1;
        addWarningToUser(nickname, reason);
        
        if (currentWarnings >= 3) {
            alert(`⚠️ У пользователя ${nickname} уже ${currentWarnings}/3 выговоров! Рекомендуется выдать бан.`);
        }
    } 
    else if (punishType === 'ban') {
        typeName = '🚫 БАН';
        const durationSelect = document.getElementById('banDuration');
        duration = durationSelect ? durationSelect.value : 'Навсегда';
        if (!reason) { alert("Введите причину бана"); return; }
    } 
    else if (punishType === 'mute') {
        typeName = '🔇 МУТ';
        const durationSelect = document.getElementById('muteDuration');
        duration = durationSelect ? durationSelect.value : '1 час';
        if (!reason) { alert("Введите причину мута"); return; }
    }
    
    const adminRank = `${currentUser.lvl} LVL · ${rankNames[currentUser.lvl]}${currentUser.subRole ? ` · ${currentUser.subRole}` : ''}`;
    
    let message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${typeName}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👮 Где состоит: ${adminRank}\n`;
    message += `👤 Ник нарушителя: ${nickname}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📝 Причина: ${reason}\n`;
    
    if (duration) {
        message += `⏰ Срок: ${duration}\n`;
    }
    
    if (punishType === 'strike') {
        const newCount = getWarningCount(nickname);
        message += `⚠️ Выговоров теперь: ${newCount}/3\n`;
    }
    
    message += `👮 Выдал: ${currentUser.nickname}\n`;
    message += `📅 Дата: ${new Date().toLocaleString()}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    socket.emit('send message', {
        chat: 'warnings_list',
        from: currentUser.nickname,
        text: message,
        lvl: currentUser.lvl,
        color: rankColors[currentUser.lvl]
    });
    
    alert(`✅ ${typeName} выдан пользователю ${nickname}`);
    closeModal();
    
    if (punishType === 'ban') {
        toggleFreeze(nickname, reason);
    }
}

// ===== УЧАСТНИКИ =====
function showMembersPanel() { 
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody'); 
    const sorted = [...allUsers].sort((a, b) => b.lvl - a.lvl); 
    
    modalBody.innerHTML = `<h3>👥 Все участники</h3><div style="max-height:400px;overflow-y:auto;">${sorted.map(user => `
        <div style="padding:10px;border-bottom:1px solid rgba(0,191,255,0.2);display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="openUserModal('${user.nickname}')">
            <div style="width:36px;height:36px;border-radius:10px;background:${rankColors[user.lvl]};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;text-shadow:0 0 2px black;">${user.lvl}</div>
            <div>
                <div style="color:#ffdd00;font-weight:bold;text-shadow:0 0 1px black;">${escapeHtml(user.nickname)}</div>
                <div style="color:#00bfff;font-size:11px;">${rankNames[user.lvl]} ${user.subRole ? '· ' + user.subRole : ''}</div>
                <div style="color:#ffaa33;font-size:10px;">⚠️ Выговоры: ${getWarningCount(user.nickname)}/3</div>
            </div>
        </div>`).join('')}</div>`; 
    modal.style.display = 'block'; 
}

function openUserModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname); 
    if (!user) return;
    
    const joinDate = new Date(user.joinDate); 
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear(); 
    let months = now.getMonth() - joinDate.getMonth();
    if (months < 0) { 
        years--; 
        months += 12; 
    }
    let exp = years > 0 ? `${years} год${years > 1 ? 'а' : ''} ${months > 0 ? months + ' мес.' : ''}` : months > 0 ? `${months} месяц${months > 1 ? 'а' : ''}` : '< 1 мес.';
    
    const warningsList = userWarnings[nickname] || [];
    const warningsHtml = warningsList.length > 0 ? 
        `<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;">
            <strong style="color:#ffaa33;">⚠️ Выговоры (${warningsList.length}/3):</strong>
            ${warningsList.map(w => `<div style="font-size:12px;margin-top:5px;padding:5px;border-bottom:1px solid rgba(0,191,255,0.2);">📅 ${w.date}<br>📝 ${escapeHtml(w.reason)}<br>👮 Выдал: ${w.giver}</div>`).join('')}
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
        
        <p><strong>👤 Ник:</strong> <span style="color:#ffdd00;text-shadow:0 0 1px black;">${escapeHtml(user.nickname)}</span></p>
        <p><strong>👤 Имя:</strong> <span style="color:#ffdd00;text-shadow:0 0 1px black;">${escapeHtml(user.name)}</span></p>
        <p><strong>🎂 Дата рождения:</strong> ${user.birthDate || '—'}</p>
        <p><strong>📅 Дата вступления:</strong> ${user.joinDate} → <span style="color:#ffdd00;">${exp}</span></p>
        <p><strong>📝 Комментарий:</strong> ${user.comment || '—'}</p>
        ${user.frozen ? `<p><strong>❄️ Заморожен:</strong> ${user.frozenReason || 'Без причины'}</p>` : ''}
        ${warningsHtml}
        
        <div class="user-actions-modal">
            ${currentUser.lvl === 7 ? `
                <button class="user-action-btn edit" onclick="editUser('${user.nickname}')">✏️ Редактировать</button>
                <button class="user-action-btn warn" onclick="openPunishModal('${user.nickname}')">⚖️ Выдать наказание</button>
                <button class="user-action-btn freeze" onclick="toggleFreeze('${user.nickname}')">${user.frozen ? '❄️ Разморозить' : '🔥 Заморозить'}</button>
                ${user.nickname !== 'STORM_X' ? `<button class="user-action-btn delete" onclick="deleteUser('${user.nickname}')">❌ Удалить</button>` : ''}
            ` : '<p style="color:#888;">👁️ Только просмотр</p>'}
        </div>
    `;
    modal.style.display = 'block';
}

// ===== АДМИН ФУНКЦИИ =====
async function loadMembers() { 
    try {
        const res = await fetch('/api/users'); 
        const data = await res.json(); 
        if (!data.error) { 
            allUsers = data; 
            renderMembersList(); 
        } 
    } catch(e) {
        console.error('Ошибка загрузки участников:', e);
    }
}

function renderMembersList() { 
    const container = document.getElementById('membersList'); 
    if (!container) return; 
    const sorted = [...allUsers].sort((a, b) => b.lvl - a.lvl); 
    
    container.innerHTML = sorted.map(user => `
        <div class="member-item" data-nickname="${user.nickname}">
            <div class="member-rank-badge" style="background:${rankColors[user.lvl]}; text-shadow:0 0 2px black;">${user.lvl} LVL</div>
            <div class="member-info">
                <div class="member-nick">${escapeHtml(user.nickname)}</div>
                <div class="member-name">${escapeHtml(user.name)}</div>
                <div class="member-role">${rankNames[user.lvl]}${user.subRole ? ` · ${user.subRole}` : ''}</div>
                <div style="color:#ffaa33; font-size:10px;">⚠️ ${getWarningCount(user.nickname)}/3</div>
            </div>
            ${user.frozen ? '<div class="frozen-badge">❄️</div>' : ''}
        </div>
    `).join(''); 
    
    document.querySelectorAll('.member-item').forEach(el => 
        el.addEventListener('click', () => openUserModal(el.dataset.nickname))
    ); 
}

function openAddUserModal() { 
    if (currentUser.lvl !== 7) return; 
    
    const modal = document.getElementById('modal'); 
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div id="modalBody">
                <h3>➕ Добавить участника</h3>
                <label>Ник (логин):</label>
                <input id="addNickname" placeholder="Введите ник">
                <label>Имя:</label>
                <input id="addName" placeholder="Введите имя">
                <label>Пароль:</label>
                <input id="addPassword" type="text" placeholder="Введите пароль">
                <label>Ранг:</label>
                <select id="addLvl">
                    <option value="1">Гость</option>
                    <option value="2">Squad 545</option>
                    <option value="3">Трудовой состав</option>
                    <option value="4">Команда Ураган</option>
                    <option value="5">Модератор</option>
                    <option value="6">Администратор</option>
                </select>
                <label>Подроль (должность):</label>
                <input id="addSubRole" placeholder="Монтажёр, Художник...">
                <label>Дата рождения:</label>
                <input id="addBirthDate" placeholder="ДД.ММ.ГГГГ">
                <label>Комментарий:</label>
                <textarea id="addComment" rows="2" placeholder="Дополнительная информация"></textarea>
                <label>📅 Дата вступления (оставьте пустым для автоматической):</label>
                <input id="addJoinDate" placeholder="ДД.ММ.ГГГГ">
                <button onclick="submitAddUser()">✅ Добавить участника</button>
            </div>
        </div>
    `; 
    modal.style.display = 'block'; 
    document.querySelector('.modal-close').onclick = closeModal; 
}

async function submitAddUser() { 
    let joinDate = document.getElementById('addJoinDate').value;
    if (!joinDate || joinDate.trim() === '') { 
        joinDate = new Date().toLocaleDateString(); 
    }
    
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
    
    try {
        const res = await fetch('/api/addUser', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        }); 
        const result = await res.json(); 
        if (result.success) { 
            closeModal(); 
            loadMembers(); 
            buildMenu(); 
            alert("Пользователь успешно добавлен!");
        } else { 
            alert(result.error); 
        }
    } catch(e) {
        alert("Ошибка при добавлении пользователя");
    }
}

function editUser(nickname) { 
    if (currentUser.lvl !== 7) return; 
    const user = allUsers.find(u => u.nickname === nickname); 
    if (!user) return;
    
    const modalBody = document.getElementById('modalBody'); 
    modalBody.innerHTML = `
        <h3>✏️ Редактировать ${nickname}</h3>
        <label>Имя:</label>
        <input id="editName" value="${user.name}">
        <label>Ранг:</label>
        <select id="editLvl">
            ${[1, 2, 3, 4, 5, 6, 7].map(l => `<option value="${l}" ${user.lvl === l ? 'selected' : ''}>${rankNames[l]}</option>`).join('')}
        </select>
        <label>Подроль:</label>
        <input id="editSubRole" value="${user.subRole || ''}">
        <label>Дата рождения:</label>
        <input id="editBirthDate" value="${user.birthDate || ''}">
        <label>Комментарий:</label>
        <textarea id="editComment" rows="2">${user.comment || ''}</textarea>
        <label>Дата вступления:</label>
        <input id="editJoinDate" value="${user.joinDate}">
        <button onclick="submitEditUser('${nickname}')">💾 Сохранить изменения</button>
    `; 
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
    
    try {
        const res = await fetch('/api/editUser', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        }); 
        const result = await res.json(); 
        if (result.success) { 
            closeModal(); 
            loadMembers(); 
            buildMenu(); 
            alert("Изменения сохранены!");
        } else { 
            alert(result.error); 
        }
    } catch(e) {
        alert("Ошибка при сохранении");
    }
}

async function toggleFreeze(nickname, customReason = null) { 
    if (currentUser.lvl !== 7) return; 
    const user = allUsers.find(u => u.nickname === nickname); 
    let reason = customReason; 
    
    if (!user.frozen && !reason) {
        reason = prompt('Причина заморозки:\n- Аккаунт в "Отпуске"\n- Аккаунт взломан\n- Странные активности на аккаунте', 'Аккаунт в "Отпуске"'); 
        if (!reason) return; 
    }
    
    try {
        const res = await fetch('/api/toggleFreeze', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ nickname, reason }) 
        }); 
        const result = await res.json(); 
        if (result.success) { 
            closeModal(); 
            loadMembers(); 
            alert(user.frozen ? "Аккаунт разморожен" : "Аккаунт заморожен");
        } else { 
            alert(result.error); 
        }
    } catch(e) {
        alert("Ошибка при заморозке");
    }
}

function deleteUser(nickname) { 
    if (currentUser.lvl !== 7) return; 
    if (nickname === 'STORM_X') {
        alert("Нельзя удалить владельца");
        return;
    }
    if (confirm(`Вы уверены, что хотите удалить пользователя ${nickname}?`)) { 
        fetch('/api/deleteUser', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ nickname }) 
        }).then(r => r.json()).then(result => { 
            if (result.success) { 
                closeModal(); 
                loadMembers(); 
                alert("Пользователь удалён");
            } else { 
                alert(result.error); 
            } 
        }).catch(e => alert("Ошибка при удалении"));
    } 
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
document.getElementById('logoutBtn')?.addEventListener('click', () => window.location.href = '/logout');

document.addEventListener('DOMContentLoaded', async () => { 
    await loadUser(); 
    
    document.getElementById('addMemberBtn')?.addEventListener('click', openAddUserModal); 
    
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    window.onclick = e => { 
        if (e.target === document.getElementById('modal')) closeModal(); 
    }; 
    
    switchChat('info_chat'); 
});
