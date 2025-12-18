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
        
        // 检查是否是重定向响应
        if (response.redirected) {
            // 检查URL中是否包含成功参数
            const url = new URL(response.url);
            const urlParams = url.searchParams;
            
            if (urlParams.get('success') === 'true') {
                showStatus(statusDiv, '注册成功，请登录', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                const error = urlParams.get('error');
                showStatus(statusDiv, error || '注册失败', 'error');
            }
        } else {
            // 处理JSON响应
            const result = await response.json();
            if (response.ok && result.result === 'ok') {
                showStatus(statusDiv, '注册成功，请登录', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                const errorMessage = result.error || '注册失败';
                showStatus(statusDiv, errorMessage, 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showStatus(statusDiv, '注册失败，请稍后重试', 'error');
    }
}

function showStatus(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = 'status ' + type;
    }
}