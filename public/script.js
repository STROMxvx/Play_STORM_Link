let socket = io();
let currentUser = null;
let currentChat = 'info_chat';
let allUsers = [];
let complaintsCounter = 1;
let currentReplyTo = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingStartTime = null;
let recordingTimerInterval = null;

let userWarnings = {};

// ===== ЦВЕТА И НАЗВАНИЯ РАНГОВ =====
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

// ===== ФУНКЦИИ ДЛЯ ОПЫТА =====
function getExperienceRank(joinDateStr) {
    const joinDate = new Date(joinDateStr);
    const now = new Date();
    const diffYears = now.getFullYear() - joinDate.getFullYear();
    const diffMonths = (diffYears * 12) + (now.getMonth() - joinDate.getMonth());
    
    if (diffMonths >= 60) return '[MEGA OLD]';
    if (diffMonths >= 36) return '[OLD]';
    if (diffMonths >= 12) return '[Старичок]';
    if (diffMonths >= 6) return '[Верный]';
    return '[Новенький]';
}

function getExperienceColor(rank) {
    switch(rank) {
        case '[MEGA OLD]': return '#ffdd00';
        case '[OLD]': return '#ffaa33';
        case '[Старичок]': return '#88ccff';
        case '[Верный]': return '#66ff66';
        default: return '#cccccc';
    }
}

// ===== ТЕКСТ ДЛЯ ЧАТА ДОЛЖНОСТИ =====
const dutiesText = `<div style="padding:10px; color:#ffffff; text-shadow:0 0 2px black;">
    <h2 style="color:#ffdd00; text-align:center;">♦️ ДОЛЖНОСТИ ♦️</h2>
    <div style="margin-top:20px;">
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 G. Admin</strong> - Правая рука ГЛ КОМАНДЫ, следит за всем. Выдаёт выговоры за нарушение</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Admin</strong> - Следит за участниками группы</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Модератор</strong> - Следит за указанной задачей</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Актёр</strong> - Человек который будет сниматься в роликах</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Сценарист</strong> - Человек который будет придумывать сценарии для сериалов и роликов</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Костюмер</strong> - Человек который будет переделывать или делать скины персонажей</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Монтажёр</strong> - Человек который будет монтировать снятый материал</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Художник</strong> - Человек который будет рисовать привью,арты,рисунки и т д</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Поисковик</strong> - Человек который ищет нужную информацию</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Нарезчик</strong> - Вырезает части стримов и видео и пересылает их на ютуб и тикток</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Билдер</strong> - Человек который занимается строительством разных построек, карт для команды "Ураган"</div>
        <div style="background:rgba(0,150,255,0.15); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Аниматор</strong> - Делает видео (Shorts) с анимации</div>
        <div style="background:rgba(0,150,255,0.2); padding:10px; border-radius:10px; margin-bottom:10px;"><strong style="color:#ffdd00;">🔸 Кодер</strong> - Делает моды, скрипты и все в это духе</div>
    </div>
</div>`;

// ===== ГЕНЕРАЦИЯ ЧАТА ОПЫТ =====
function generateExperienceText() {
    const now = new Date();
    const currentDate = now.toLocaleString('ru-RU');
    
    const membersList = [
        { nickname: 'STORM_X', name: 'Шторм', tg: 'https://t.me/Storm_X545', lvl: 7, role: 'Владелец', joinDate: '01.01.2020' },
        { nickname: 'IVAN', name: 'Иван', tg: 'https://t.me/HeTy_HuKa_E_B_T', lvl: 6, role: 'Гл. Администратор', joinDate: '01.06.2024' },
        { nickname: 'ANTON', name: 'Антон', tg: 'https://t.me/Raccx', lvl: 5, role: 'Модератор Twitch', joinDate: '01.02.2024' },
        { nickname: 'RICHARD', name: 'Ричард', tg: 'https://t.me/viiissj', lvl: 5, role: 'Модератор YT', joinDate: '20.11.2024' },
        { nickname: 'LERKA', name: 'Лерка', tg: 'https://t.me/HottPotatoess', lvl: 4, role: 'Актер', joinDate: '01.01.2022' },
        { nickname: 'HILKA', name: 'Хилка', tg: 'https://t.me/Gheeeiq', lvl: 4, role: 'Актер', joinDate: '01.05.2024' },
        { nickname: 'EGOR', name: 'Егор', tg: 'https://t.me/mef9s', lvl: 4, role: 'Актер', joinDate: '01.08.2024' }
    ];
    
    let membersHtml = '';
    for (let member of membersList) {
        const expRank = getExperienceRank(member.joinDate);
        const expColor = getExperienceColor(expRank);
        const joinDateObj = new Date(member.joinDate);
        const nowDate = new Date();
        let years = nowDate.getFullYear() - joinDateObj.getFullYear();
        let months = nowDate.getMonth() - joinDateObj.getMonth();
        if (months < 0) { years--; months += 12; }
        let expText = '';
        if (years > 0) expText = `${years} год${years > 1 ? 'а' : ''}`;
        else if (months > 0) expText = `${months} месяц${months > 1 ? 'а' : ''}`;
        else expText = 'менее месяца';
        
        membersHtml += `
            <div style="background:rgba(0,150,255,0.1); margin:8px 0; padding:10px; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <span style="color:#ffdd00; font-weight:bold;">➡️ ${member.name}</span>
                    <a href="${member.tg}" target="_blank" style="color:#88ccff; text-decoration:none;">📱 Telegram</a>
                    <span style="color:${expColor}; font-weight:bold;">${expRank}</span>
                </div>
                <div style="font-size:12px; color:#aaa;">Должность: ${member.role} | Ранг: ${member.lvl}</div>
                <div style="font-size:11px; color:#88ccff;">с ${member.joinDate} > ${expText}</div>
            </div>
        `;
    }
    
    return `<div style="padding:10px; color:#ffffff; text-shadow:0 0 2px black;">
        <h2 style="color:#ffdd00; text-align:center;">🌪 𝓨𝓹𝓪𝓻𝓪𝓷 🌪</h2>
        <div style="text-align:center; font-size:12px; color:#88ccff; margin-bottom:20px;">📅 ${currentDate} MSK</div>
        
        <div style="background:rgba(0,0,0,0.3); border-radius:15px; padding:15px; margin-bottom:20px;">
            <h3 style="color:#ffdd00; margin-bottom:10px;">🏆 Система опыта</h3>
            <div style="display:grid; grid-template-columns:1fr 2fr; gap:8px; font-size:12px;">
                <div><span style="color:#ffdd00;">[MEGA OLD]</span></div><div>— Будь в команде больше 5 лет</div>
                <div><span style="color:#ffaa33;">[OLD]</span></div><div>— Будь в команде больше 3 лет</div>
                <div><span style="color:#88ccff;">[Старичок]</span></div><div>— Будь в команде больше 1 года</div>
                <div><span style="color:#66ff66;">[Верный]</span></div><div>— Будь в команде больше 6 месяцев</div>
                <div><span style="color:#cccccc;">[Новенький]</span></div><div>— Поступление в команду</div>
            </div>
            <div style="margin-top:15px; font-size:11px; color:#aaa;">⭐ Опыт получают участники с LVL 3 - 6</div>
        </div>
        
        <h3 style="color:#ffdd00; margin-bottom:15px;">👥 Участники команды:</h3>
        ${membersHtml}
    </div>`;
}

// ===== ПРАВИЛА =====
const rulesText = `<div style="padding:10px; color:#ffffff; text-shadow:0 0 2px black;">
    <h2 style="color:#ffdd00; text-align:center;">📜 ПРАВИЛА СООБЩЕСТВА</h2>
    <div style="margin-top:20px;">
        <div style="background:rgba(255,51,102,0.2); padding:10px; border-radius:10px;"><strong style="color:#ffdd00;">❗️ ЗАПРЕЩАЕТСЯ:</strong></div>
        <div style="margin-top:10px;">
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Унижения и оскорбления</span><span style="color:#ffaa33;">Выговор</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Флуд, боты, стикеры</span><span style="color:#ffaa33;">Мут 10мин</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Неуважение к участникам</span><span style="color:#ffaa33;">Мут 15мин</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Превышение полномочий</span><span style="color:#ffaa33;">1 Выговор</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Ссылки без разрешения</span><span style="color:#ffaa33;">Мут 30мин</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Оскорбления игроков</span><span style="color:#ffaa33;">1 Выговор</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Спам сообщений</span><span style="color:#ffaa33;">Мут 10-120мин</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Агрессия</span><span style="color:#ffaa33;">1-2 Выговора</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Оскорбление администрации</span><span style="color:#ff4444;">БАН</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🚫 Предательство</span><span style="color:#ff4444;">БАН</span></div>
        </div>
        <div style="background:rgba(255,68,68,0.2); padding:10px; border-radius:10px; margin-top:15px;"><strong style="color:#ffdd00;">⚠️ ОСОБО ЗАПРЕЩАЕТСЯ:</strong></div>
        <div style="margin-top:10px;">
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🔗 Разговоры о политике</span><span style="color:#ff4444;">Бан</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>🔞 Контент 18+</span><span style="color:#ff4444;">Бан</span></div>
            <div style="display:grid; grid-template-columns:2fr 1fr; padding:6px; border-bottom:1px solid #00bfff33;"><span>📢 Призывы к бунтам</span><span style="color:#ff4444;">БАН + ЧС</span></div>
        </div>
    </div>
</div>`;

// ===== СТРУКТУРА МЕНЮ =====
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
                    { id: "warnings_list", name: "⚠️ Выговоры", isChat: true, readOnly: true },
                    { id: "complaints", name: "📋 Жалобы", isChat: true, isComplaint: true },
                    { id: "ideas", name: "💡 Идеи", isChat: true },
                    { id: "tasks", name: "📌 Задачи", isChat: true },
                    { id: "rules", name: "📜 Правила", isChat: true, readOnly: true },
                    { id: "duties", name: "📋 Должности", isChat: true, readOnly: true },
                    { id: "experience", name: "🏆 Опыт", isChat: true, readOnly: true }
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

const chatNames = {
    info_chat: '📢 Информация',
    announcements: '📣 Объявления',
    complaints: '📋 Жалобы',
    ideas: '💡 Идеи',
    tasks: '📌 Задачи',
    rules: '📜 Правила',
    duties: '📋 Должности',
    experience: '🏆 Опыт',
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

let currentMessages = [];
let editingMessageId = null;

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
        
        await loadWarnings();
        buildMenu();
        setupMobile();
        setupVoiceRecording();
        setupFileUpload();
        switchChat('info_chat');
    } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
        window.location.href = '/login.html';
    }
}

// ===== МОБИЛЬНАЯ ВЕРСИЯ =====
function setupMobile() {
    const isMobile = window.innerWidth <= 768;
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileUsersBtn = document.getElementById('mobileUsersBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebarLeft = document.getElementById('sidebarLeft');
    const sidebarRight = document.getElementById('sidebarRight');
    
    if (isMobile) {
        if (mobileMenuBtn) {
            mobileMenuBtn.onclick = () => {
                sidebarLeft.classList.toggle('open');
                if (sidebarRight.classList.contains('open')) sidebarRight.classList.remove('open');
                if (mobileOverlay) mobileOverlay.classList.toggle('active');
            };
        }
        if (mobileUsersBtn) {
            mobileUsersBtn.onclick = () => {
                sidebarRight.classList.toggle('open');
                if (sidebarLeft.classList.contains('open')) sidebarLeft.classList.remove('open');
                if (mobileOverlay) mobileOverlay.classList.toggle('active');
            };
        }
        if (mobileOverlay) {
            mobileOverlay.onclick = () => {
                sidebarLeft.classList.remove('open');
                sidebarRight.classList.remove('open');
                mobileOverlay.classList.remove('active');
            };
        }
    }
}

// ===== ГОЛОСОВЫЕ СООБЩЕНИЯ =====
function setupVoiceRecording() {
    const voiceBtn = document.getElementById('voiceBtn');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const messageInput = document.getElementById('messageInput');
    
    if (!voiceBtn) return;
    
    voiceBtn.onmousedown = async () => {
        if (isRecording) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const audioUrl = reader.result;
                    sendMessage(audioUrl, 'audio');
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                recordingIndicator.classList.remove('active');
                if (messageInput) messageInput.placeholder = "Введите сообщение...";
                isRecording = false;
                if (recordingTimerInterval) clearInterval(recordingTimerInterval);
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            recordingIndicator.classList.add('active');
            if (messageInput) messageInput.placeholder = "🎙️ Запись... Отпустите для отправки";
            
            recordingTimerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                const timerSpan = document.getElementById('recordingTimer');
                if (timerSpan) timerSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        } catch (err) {
            alert("Нет доступа к микрофону");
        }
    };
    
    voiceBtn.onmouseup = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
    };
    
    voiceBtn.onmouseleave = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
    };
}

// ===== ЗАГРУЗКА ФАЙЛОВ =====
function setupFileUpload() {
    const attachBtn = document.getElementById('attachBtn');
    if (!attachBtn) return;
    
    attachBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,application/pdf,.txt,.doc,.docx';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const progressDiv = document.getElementById('uploadProgress');
            const progressBar = document.getElementById('uploadProgressBar');
            const percentSpan = document.getElementById('uploadPercent');
            if (progressDiv) progressDiv.classList.add('active');
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const fileData = reader.result;
                const fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: fileData
                };
                sendMessage(JSON.stringify(fileInfo), 'file');
                if (progressDiv) progressDiv.classList.remove('active');
            };
            
            reader.onprogress = (e) => {
                if (e.lengthComputable && progressBar && percentSpan) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    percentSpan.textContent = percent;
                    progressBar.value = percent;
                }
            };
            
            reader.readAsDataURL(file);
        };
        input.click();
    };
}

// ===== ВЫГОВОРЫ =====
async function loadWarnings() { 
    try {
        const res = await fetch('/api/warnings');
        const data = await res.json();
        userWarnings = data || {};
    } catch(e) {
        userWarnings = {};
    }
}

async function addWarningToUser(nickname, reason) { 
    if (!userWarnings[nickname]) userWarnings[nickname] = [];
    userWarnings[nickname].push({ 
        reason: reason, 
        date: new Date().toLocaleString(), 
        giver: currentUser.nickname 
    });
    await fetch('/api/addWarning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, reason })
    });
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
    localStorage.setItem(`menu_${parentId}`, currentState === 'open' ? 'closed' : 'open');
    buildMenu(); 
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЧАТА =====
function switchChat(chatId) {
    currentChat = chatId; 
    buildMenu();
    currentReplyTo = null;
    editingMessageId = null;
    
    const headerSpan = document.getElementById('currentChatName');
    if (headerSpan) headerSpan.innerHTML = chatNames[chatId] || chatId;
    
    const inputArea = document.getElementById('chatInputArea');
    const isComplaintChat = chatId === 'complaints';
    const isReadOnlyChat = ['rules', 'duties', 'experience', 'warnings_list'].includes(chatId);
    
    if (isComplaintChat) {
        if (inputArea) {
            inputArea.innerHTML = `
                <div style="width:100%; display:flex; justify-content:center;">
                    <button id="complaintBtn" style="padding:12px 24px; background:#ff3366; border:none; border-radius:30px; color:white; font-weight:bold; width:100%;">📋 Подать жалобу</button>
                </div>
            `;
            document.getElementById('complaintBtn')?.addEventListener('click', openComplaintModal);
        }
    } 
    else if (isReadOnlyChat) {
        if (currentUser.lvl === 7 && chatId !== 'warnings_list') {
            if (inputArea) {
                inputArea.innerHTML = `<div style="width:100%;display:flex;gap:10px;"><button id="editReadOnlyBtn" style="padding:12px 24px;background:#ffdd00;color:#000;border:none;border-radius:30px;font-weight:bold;">✏️ Редактировать</button><button id="saveReadOnlyBtn" style="display:none;padding:12px 24px;background:#00ff88;color:#000;border:none;border-radius:30px;font-weight:bold;">💾 Сохранить</button></div>`;
            }
            document.getElementById('editReadOnlyBtn')?.addEventListener('click', () => {
                const msgDiv = document.getElementById('chatMessages');
                const currentText = msgDiv.innerText;
                if (msgDiv) {
                    msgDiv.innerHTML = `<textarea id="readOnlyEditor" style="width:100%;height:400px;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;padding:15px;border-radius:15px;font-size:14px;">${currentText}</textarea>`;
                }
                const editBtn = document.getElementById('editReadOnlyBtn');
                const saveBtn = document.getElementById('saveReadOnlyBtn');
                if (editBtn) editBtn.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'block';
            });
            document.getElementById('saveReadOnlyBtn')?.addEventListener('click', () => {
                const editor = document.getElementById('readOnlyEditor');
                const newText = editor ? editor.value : '';
                socket.emit('send message', { chat: chatId, from: currentUser.nickname, text: newText, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
                const editBtn = document.getElementById('editReadOnlyBtn');
                const saveBtn = document.getElementById('saveReadOnlyBtn');
                if (editBtn) editBtn.style.display = 'block';
                if (saveBtn) saveBtn.style.display = 'none';
                switchChat(chatId);
            });
        } else {
            if (inputArea) {
                inputArea.innerHTML = `<div style="width:100%;text-align:center;color:#888;padding:10px">🔒 Чат только для чтения</div>`;
            }
        }
    } 
    else {
        if (inputArea) {
            inputArea.innerHTML = `
                <div class="input-buttons">
                    <button id="attachBtn" class="input-btn" title="Прикрепить файл">📎</button>
                    <button id="voiceBtn" class="input-btn" title="Голосовое сообщение">🎤</button>
                </div>
                <div class="recording-indicator" id="recordingIndicator">
                    <span>🔴 Запись...</span>
                    <span class="recording-timer" id="recordingTimer">0:00</span>
                </div>
                <input type="text" id="messageInput" placeholder="Введите сообщение...">
                <button id="sendBtn">📤</button>
            `;
            document.getElementById('sendBtn')?.addEventListener('click', () => sendMessage());
            document.getElementById('messageInput')?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
            setupVoiceRecording();
            setupFileUpload();
        }
    }
    
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) messagesDiv.innerHTML = '<div class="welcome-message">Загрузка...</div>';
    
    if (chatId === 'rules') { 
        if (messagesDiv) messagesDiv.innerHTML = rulesText; 
    } else if (chatId === 'duties') {
        if (messagesDiv) messagesDiv.innerHTML = dutiesText;
    } else if (chatId === 'experience') {
        if (messagesDiv) messagesDiv.innerHTML = generateExperienceText();
        setInterval(() => {
            if (currentChat === 'experience' && messagesDiv) {
                messagesDiv.innerHTML = generateExperienceText();
            }
        }, 60000);
    } else { 
        socket.emit('join chat', chatId); 
    }
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
function sendMessage(customContent, contentType = 'text') {
    const input = document.getElementById('messageInput');
    let text = customContent || (input ? input.value.trim() : '');
    
    if (!text && contentType === 'text') return;
    
    let finalText = text;
    if (contentType === 'audio') {
        finalText = `[🎤 Голосовое сообщение](${text})`;
    } else if (contentType === 'file') {
        finalText = `[📎 Файл](${text})`;
    }
    
    if (currentReplyTo) {
        finalText = `📌 Ответ на сообщение от ${currentReplyTo.from}: "${currentReplyTo.text.substring(0, 50)}"\n━━━━━━━━━━━━━━━━\n${finalText}`;
        currentReplyTo = null;
    }
    
    const messageData = {
        chat: currentChat,
        from: currentUser.nickname,
        text: finalText,
        lvl: currentUser.lvl,
        color: rankColors[currentUser.lvl],
        timestamp: Date.now()
    };
    
    if (editingMessageId) {
        messageData.editId = editingMessageId;
        messageData.newText = finalText;
        editingMessageId = null;
    }
    
    socket.emit('send message', messageData);
    if (input) input.value = '';
}

// ===== РЕДАКТИРОВАНИЕ =====
function editMessage(messageId, currentText) {
    const newText = prompt("Редактировать сообщение:", currentText);
    if (newText && newText.trim()) {
        socket.emit('edit message', { id: messageId, chat: currentChat, text: newText, from: currentUser.nickname });
    }
}

// ===== УДАЛЕНИЕ =====
function deleteMessage(messageId) {
    if (confirm("Удалить сообщение?")) {
        socket.emit('delete message', { id: messageId, chat: currentChat, from: currentUser.nickname, isAdmin: currentUser.lvl === 7 });
    }
}

// ===== ОТВЕТ =====
function replyToMessage(from, text) {
    currentReplyTo = { from, text };
    const input = document.getElementById('messageInput');
    if (input) {
        input.focus();
        input.placeholder = `📌 Ответ ${from}...`;
        setTimeout(() => { if (input) input.placeholder = "Введите сообщение..."; }, 3000);
    }
}

// ===== ЖАЛОБЫ =====
function openComplaintModal() {
    const modal = document.getElementById('modal'); 
    const modalBody = document.getElementById('modalBody');
    const usersList = allUsers.map(u => `<option value="${u.nickname}">${u.nickname} (${u.name}) - ${rankNames[u.lvl]}</option>`).join('');
    
    if (modalBody) {
        modalBody.innerHTML = `
            <h3>📋 ЖАЛОБА №${complaintsCounter}</h3>
            <p style="color:#88aaff;font-size:12px;margin-bottom:15px;">Я подаю жалобу без корыстных целей</p>
            <label>👤 Подающий жалобу:</label>
            <select id="complainantNick">${usersList}</select>
            <label>👤 На кого жалоба:</label>
            <select id="targetNick">${usersList}</select>
            <label>📝 Описание:</label>
            <textarea id="complaintDesc" rows="2"></textarea>
            <label>⚠️ Что нарушил:</label>
            <input id="violation" placeholder="Укажите нарушение">
            <label>⚡ Наказание:</label>
            <input id="punishment" placeholder="Выговор / Бан / Мут">
            <button onclick="submitComplaint()">📨 Отправить</button>
        `;
    }
    if (modal) modal.style.display = 'block';
}

function submitComplaint() {
    const complainant = document.getElementById('complainantNick')?.value;
    const target = document.getElementById('targetNick')?.value;
    const desc = document.getElementById('complaintDesc')?.value;
    const violation = document.getElementById('violation')?.value;
    const punishment = document.getElementById('punishment')?.value;
    
    if (!complainant || !target || !desc) { alert("Заполните поля"); return; }
    
    const msg = `📋 ЖАЛОБА №${complaintsCounter}\n👤 Подал: ${complainant}\n👤 Нарушитель: ${target}\n📝 ${desc}\n⚠️ Нарушение: ${violation}\n⚡ Наказание: ${punishment}\n📅 ${new Date().toLocaleString()}`;
    socket.emit('send message', { chat: 'complaints', from: currentUser.nickname, text: msg, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
    complaintsCounter++;
    closeModal();
    alert("✅ Жалоба отправлена!");
}

// ===== СОКЕТЫ =====
socket.on('chat history', (msgs) => { 
    currentMessages = msgs || [];
    const c = document.getElementById('chatMessages'); 
    if (!c) return;
    c.innerHTML = ''; 
    if (!msgs || msgs.length === 0) { 
        c.innerHTML = '<div class="welcome-message">✨ Сообщений нет.</div>'; 
        return; 
    } 
    msgs.forEach(m => addMessageToChat(m)); 
});

socket.on('new message', (m) => {
    currentMessages.push(m);
    addMessageToChat(m);
});

socket.on('message edited', (data) => {
    const msgElement = document.querySelector(`.message[data-id="${data.id}"] .message-text`);
    if (msgElement) msgElement.innerHTML = escapeHtml(data.newText);
});

socket.on('message deleted', (data) => {
    const msgElement = document.querySelector(`.message[data-id="${data.id}"]`);
    if (msgElement) msgElement.remove();
});

function addMessageToChat(m) {
    const c = document.getElementById('chatMessages');
    if (!c) return;
    const isOwn = m.from === currentUser.nickname;
    const messageId = m.timestamp || Date.now() + Math.random();
    
    let displayText = m.text;
    let filePreview = '';
    
    if (m.text && m.text.startsWith('[🎤 Голосовое сообщение]')) {
        const audioUrl = m.text.match(/\(([^)]+)\)/)?.[1];
        if (audioUrl) {
            displayText = '';
            filePreview = `<audio controls src="${audioUrl}" style="max-width:100%; border-radius:20px;"></audio>`;
        }
    } else if (m.text && m.text.startsWith('[📎 Файл]')) {
        const fileData = m.text.match(/\(([^)]+)\)/)?.[1];
        if (fileData) {
            try {
                const fileInfo = JSON.parse(fileData);
                if (fileInfo.type.startsWith('image/')) {
                    filePreview = `<img src="${fileInfo.data}" style="max-width:200px; max-height:200px; border-radius:10px; cursor:pointer;" onclick="window.open('${fileInfo.data}')">`;
                    displayText = '';
                } else if (fileInfo.type.startsWith('video/')) {
                    filePreview = `<video controls src="${fileInfo.data}" style="max-width:200px; border-radius:10px;"></video>`;
                    displayText = '';
                } else {
                    filePreview = `<a href="${fileInfo.data}" download="${fileInfo.name}" style="color:#88ccff;">📎 ${fileInfo.name} (${Math.round(fileInfo.size/1024)} KB)</a>`;
                    displayText = '';
                }
            } catch(e) { displayText = m.text; }
        }
    }
    
    const div = document.createElement('div'); 
    div.className = `message ${isOwn ? 'own' : ''}`;
    div.setAttribute('data-id', messageId);
    div.innerHTML = `
        <div class="message-header">
            <span class="message-rank" style="background:${m.color || rankColors[m.lvl]}">${m.lvl} LVL</span>
            <span class="message-from">${escapeHtml(m.from)}</span>
            <span class="message-time">${m.time}</span>
        </div>
        ${filePreview}
        <div class="message-text" style="white-space:pre-wrap;">${escapeHtml(displayText)}</div>
        <div class="message-actions">
            <button class="message-action-btn" onclick="replyToMessage('${escapeHtml(m.from)}', '${escapeHtml(displayText.substring(0, 50))}')">↩️ Ответить</button>
            ${isOwn ? `<button class="message-action-btn" onclick="editMessage('${messageId}', '${escapeHtml(displayText)}')">✏️</button>` : ''}
            ${(isOwn || currentUser.lvl === 7) ? `<button class="message-action-btn" onclick="deleteMessage('${messageId}')">🗑️</button>` : ''}
        </div>
    `;
    c.appendChild(div); 
    c.scrollTop = c.scrollHeight;
}

function escapeHtml(s) { 
    if (!s) return ''; 
    return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); 
}

// ===== НАКАЗАНИЯ =====
function openPunishModal(nickname) {
    const user = allUsers.find(u => u.nickname === nickname);
    if (!user) return;
    const modal = document.getElementById('modal'); 
    const body = document.getElementById('modalBody');
    
    if (body) {
        body.innerHTML = `
            <h3>⚖️ Наказание для ${nickname}</h3>
            <div style="text-align:center;margin:15px 0;">
                <span style="background:${rankColors[user.lvl]};padding:6px 20px;border-radius:30px;color:white;">${user.lvl} LVL · ${rankNames[user.lvl]}</span>
                <div style="margin-top:5px;">⚠️ Выговоры: ${getWarningCount(nickname)}/3</div>
            </div>
            <label>Тип наказания:</label>
            <select id="pt" style="width:100%;padding:12px;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;border-radius:14px;">
                <option value="warning">📝 Устное предупреждение</option>
                <option value="strike">🔴 Выговор</option>
                <option value="ban">🚫 Бан</option>
                <option value="mute">🔇 Мут</option>
            </select>
            <div id="pf" style="margin-top:15px;"></div>
            <button onclick="submitPunish('${nickname}')" style="width:100%;margin-top:20px;">✅ Отправить</button>
        `;
    }
    if (modal) modal.style.display = 'block';
    const ptSelect = document.getElementById('pt');
    if (ptSelect) ptSelect.onchange = () => updatePunishForm();
    updatePunishForm();
}

function updatePunishForm() {
    const t = document.getElementById('pt')?.value;
    const f = document.getElementById('pf');
    if (!f) return;
    if (t === 'warning') {
        f.innerHTML = `<label>Причина:</label><textarea id="pr" rows="2" style="width:100%;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;border-radius:10px;padding:10px;"></textarea>`;
    } else if (t === 'strike') {
        f.innerHTML = `<label>Причина:</label><input id="pr" style="width:100%;padding:12px;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;border-radius:14px;" placeholder="Укажите причину выговора">`;
    } else if (t === 'ban') {
        f.innerHTML = `<label>Причина:</label><textarea id="pr" rows="2" style="width:100%;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;border-radius:10px;"></textarea><label>Срок:</label><select id="dur" style="width:100%;padding:12px;background:#0a1e3a;color:#ffdd00;"><option>1 день</option><option>7 дней</option><option>30 дней</option><option>Навсегда</option></select>`;
    } else {
        f.innerHTML = `<label>Причина:</label><textarea id="pr" rows="2" style="width:100%;background:#0a1e3a;color:#ffdd00;border:1px solid #00bfff;"></textarea><label>Время:</label><select id="dur" style="width:100%;padding:12px;background:#0a1e3a;color:#ffdd00;"><option>10 мин</option><option>30 мин</option><option>1 час</option><option>1 день</option></select>`;
    }
}

async function submitPunish(nickname) {
    const type = document.getElementById('pt')?.value;
    let reason = document.getElementById('pr')?.value || '';
    let duration = document.getElementById('dur')?.value || '';
    let typeName = type === 'warning' ? '📝 УСТНОЕ ПРЕДУПРЕЖДЕНИЕ' : type === 'strike' ? '🔴 ВЫГОВОР' : type === 'ban' ? '🚫 БАН' : '🔇 МУТ';
    
    if (!reason) { alert("Введите причину"); return; }
    
    const msg = `${typeName}\n━━━━━━━━━━━━━━━━━━━━━━\n👮 Выдал: ${currentUser.nickname} (${currentUser.lvl} LVL)\n👤 Нарушитель: ${nickname}\n📝 Причина: ${reason}${duration ? `\n⏰ Срок: ${duration}` : ''}\n📅 ${new Date().toLocaleString()}`;
    socket.emit('send message', { chat: 'warnings_list', from: currentUser.nickname, text: msg, lvl: currentUser.lvl, color: rankColors[currentUser.lvl] });
    
    if (type === 'strike') {
        await addWarningToUser(nickname, reason);
        alert(`Выговор выдан! ${getWarningCount(nickname)}/3`);
    }
    if (type === 'ban') toggleFreeze(nickname, reason);
    closeModal();
}

// ===== УЧАСТНИКИ =====
function showMembersPanel() {
    const modal = document.getElementById('modal'); 
    const body = document.getElementById('modalBody');
    const sorted = [...allUsers].sort((a,b) => b.lvl - a.lvl);
    if (body) {
        body.innerHTML = `<h3>👥 Участники</h3><div>${sorted.map(u => `<div style="padding:10px;cursor:pointer;border-bottom:1px solid #00bfff33;" onclick="openUserModal('${u.nickname}')"><div style="color:#ffdd00;">${u.nickname}</div><div>${rankNames[u.lvl]} ${u.subRole||''}</div><div style="color:#ffaa33;">⚠️ ${getWarningCount(u.nickname)}/3</div></div>`).join('')}</div>`;
    }
    if (modal) modal.style.display = 'block';
}

function openUserModal(nickname) {
    const u = allUsers.find(u => u.nickname === nickname);
    if (!u) return;
    const joinDate = new Date(u.joinDate);
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();
    if (months < 0) { years--; months += 12; }
    const exp = years > 0 ? `${years} г ${months > 0 ? months + ' мес' : ''}` : months > 0 ? `${months} мес` : '<1 мес';
    const expRank = getExperienceRank(u.joinDate);
    const expColor = getExperienceColor(expRank);
    const warns = userWarnings[nickname] || [];
    
    const modal = document.getElementById('modal'); 
    const body = document.getElementById('modalBody');
    if (body) {
        body.innerHTML = `
            <h3>${u.nickname}</h3>
            <div style="text-align:center;"><span style="background:${rankColors[u.lvl]};padding:6px 20px;border-radius:30px;color:white;">${u.lvl} LVL · ${rankNames[u.lvl]}</span>${u.subRole ? `<div>📌 ${u.subRole}</div>` : ''}<div>⚠️ ${warns.length}/3</div><div style="color:${expColor};">${expRank}</div></div>
            <p>👤 Имя: <span style="color:#ffdd00;">${u.name}</span></p><p>🎂 ДР: ${u.birthDate||'—'}</p><p>📅 Вступление: ${u.joinDate} → ${exp}</p><p>📝 ${u.comment||'—'}</p>
            ${warns.length ? `<div style="background:#0003;border-radius:10px;padding:10px;"><strong>⚠️ Выговоры:</strong>${warns.map(w => `<div>📅 ${w.date}<br>📝 ${w.reason}<br>👮 ${w.giver}</div>`).join('')}</div>` : ''}
            <div class="user-actions-modal">${currentUser.lvl === 7 ? `<button class="user-action-btn edit" onclick="editUser('${u.nickname}')">✏️</button><button class="user-action-btn warn" onclick="openPunishModal('${u.nickname}')">⚖️</button><button class="user-action-btn freeze" onclick="toggleFreeze('${u.nickname}')">${u.frozen ? '❄️' : '🔥'}</button>${u.nickname !== 'STORM_X' ? `<button class="user-action-btn delete" onclick="deleteUser('${u.nickname}')">❌</button>` : ''}` : '<p>👁️ Просмотр</p>'}</div>
        `;
    }
    if (modal) modal.style.display = 'block';
}

// ===== АДМИН ФУНКЦИИ =====
async function loadMembers() { 
    try {
        const res = await fetch('/api/users'); 
        const data = await res.json(); 
        if (!data.error) { allUsers = data; renderMembersList(); }
    } catch(e) { console.error(e); }
}

function renderMembersList() { 
    const c = document.getElementById('membersList'); 
    if (!c) return; 
    c.innerHTML = allUsers.sort((a,b) => b.lvl - a.lvl).map(u => `
        <div class="member-item" data-nickname="${u.nickname}">
            <div class="member-rank-badge" style="background:${rankColors[u.lvl]}">${u.lvl} LVL</div>
            <div><div class="member-nick">${u.nickname}</div><div class="member-name">${u.name}</div><div>${rankNames[u.lvl]}${u.subRole ? ` · ${u.subRole}` : ''}</div><div style="color:#ffaa33;">⚠️ ${getWarningCount(u.nickname)}/3</div></div>${u.frozen ? '❄️' : ''}
        </div>`).join('');
    document.querySelectorAll('.member-item').forEach(el => el.addEventListener('click', () => openUserModal(el.dataset.nickname)));
}

function openAddUserModal() { 
    if (currentUser.lvl !== 7) return; 
    const modal = document.getElementById('modal'); 
    if (modal) {
        modal.innerHTML = `<div class="modal-content"><span class="modal-close">&times;</span><div id="modalBody"><h3>➕ Добавить</h3><label>Ник:</label><input id="addNickname"><label>Имя:</label><input id="addName"><label>Пароль:</label><input id="addPassword"><label>Ранг:</label><select id="addLvl"><option value="1">Гость</option><option value="2">Squad 545</option><option value="3">Трудовой состав</option><option value="4">Ураган</option><option value="5">Модератор</option><option value="6">Админ</option></select><label>Подроль:</label><input id="addSubRole"><label>ДР:</label><input id="addBirthDate"><label>Коммент:</label><textarea id="addComment"></textarea><label>Дата вступления:</label><input id="addJoinDate" placeholder="ДД.ММ.ГГГГ"><button onclick="submitAddUser()">✅ Добавить</button></div></div>`; 
        modal.style.display = 'block'; 
        const closeSpan = document.querySelector('.modal-close');
        if (closeSpan) closeSpan.onclick = closeModal;
    }
}

async function submitAddUser() { 
    let jd = document.getElementById('addJoinDate')?.value; 
    if (!jd) jd = new Date().toLocaleDateString(); 
    const data = { 
        nickname: document.getElementById('addNickname')?.value, 
        name: document.getElementById('addName')?.value, 
        password: document.getElementById('addPassword')?.value, 
        lvl: document.getElementById('addLvl')?.value, 
        subRole: document.getElementById('addSubRole')?.value, 
        birthDate: document.getElementById('addBirthDate')?.value, 
        comment: document.getElementById('addComment')?.value, 
        joinDate: jd 
    }; 
    const res = await fetch('/api/addUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); buildMenu(); alert("Добавлено!"); } 
    else alert(result.error); 
}

function editUser(nickname) { 
    const u = allUsers.find(u => u.nickname === nickname); 
    const b = document.getElementById('modalBody'); 
    if (b) {
        b.innerHTML = `<h3>✏️ Редакт ${nickname}</h3><label>Имя:</label><input id="editName" value="${u.name}"><label>Ранг:</label><select id="editLvl">${[1,2,3,4,5,6,7].map(l => `<option value="${l}" ${u.lvl === l ? 'selected' : ''}>${rankNames[l]}</option>`).join('')}</select><label>Подроль:</label><input id="editSubRole" value="${u.subRole||''}"><label>ДР:</label><input id="editBirthDate" value="${u.birthDate||''}"><label>Коммент:</label><textarea id="editComment">${u.comment||''}</textarea><label>Дата вступления:</label><input id="editJoinDate" value="${u.joinDate}"><button onclick="submitEditUser('${nickname}')">💾 Сохранить</button>`; 
    }
}

async function submitEditUser(nickname) { 
    const data = { nickname, name: document.getElementById('editName')?.value, lvl: document.getElementById('editLvl')?.value, subRole: document.getElementById('editSubRole')?.value, birthDate: document.getElementById('editBirthDate')?.value, comment: document.getElementById('editComment')?.value, joinDate: document.getElementById('editJoinDate')?.value }; 
    const res = await fetch('/api/editUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); buildMenu(); alert("Сохранено!"); } 
    else alert(result.error); 
}

async function toggleFreeze(nickname, reason = null) { 
    let r = reason; 
    if (!r) r = prompt('Причина заморозки:'); 
    if (!r) return; 
    const res = await fetch('/api/toggleFreeze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname, reason: r }) }); 
    const result = await res.json(); 
    if (result.success) { closeModal(); loadMembers(); } 
    else alert(result.error); 
}

function deleteUser(nickname) { 
    if (confirm(`Удалить ${nickname}?`)) { 
        fetch('/api/deleteUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname }) }).then(r => r.json()).then(result => { if (result.success) { closeModal(); loadMembers(); alert("Удалён"); } else alert(result.error); }); 
    } 
}

function closeModal() { 
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none'; 
}

// ===== ЗАПУСК =====
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = '/logout');
window.addEventListener('resize', () => setupMobile());

document.addEventListener('DOMContentLoaded', async () => { 
    await loadUser(); 
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) addMemberBtn.addEventListener('click', openAddUserModal); 
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) modalClose.addEventListener('click', closeModal); 
    window.onclick = e => { if (e.target === document.getElementById('modal')) closeModal(); }; 
});
