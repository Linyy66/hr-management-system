/**
 * 注册页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
    const role = document.getElementById('reg_role').value;
    const statusDiv = document.getElementById('registerStatus');
    
    if (!username || !password) {
        showStatus(statusDiv, '请输入用户名和密码', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('role', role);
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const result = await response.json();
            if (result.result === 'ok') {
                showStatus(statusDiv, '注册成功，请登录', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1000);
            } else {
                showStatus(statusDiv, result.error || '注册失败', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showStatus(statusDiv, '注册失败，请稍后重试', 'error');
    }
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status ' + type;
}