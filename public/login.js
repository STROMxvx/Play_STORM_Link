const loginBtn = document.getElementById('loginBtn');
const nicknameInput = document.getElementById('nickname');
const passwordInput = document.getElementById('password');
const errorDiv = document.getElementById('errorMsg');

loginBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value;
    
    if (!nickname || !password) {
        errorDiv.textContent = 'Заполните все поля';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Вход...';
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            errorDiv.textContent = data.error;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Войти';
        }
    } catch (err) {
        errorDiv.textContent = 'Ошибка соединения';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Войти';
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});
