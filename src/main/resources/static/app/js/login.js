/**
 * 登录页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有错误参数
    const urlParams = new URLSearchParams(window.location.search);
    const statusDiv = document.getElementById('loginStatus');
    
    if (urlParams.has('error')) {
        showStatus(statusDiv, '用户名或密码错误', 'error');
    }
    
    // 自动填充表单（如果需要）
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && !usernameInput.value) {
        usernameInput.value = 'admin';
    }
    
    if (passwordInput && !passwordInput.value) {
        passwordInput.value = 'adminpass';
    }
});

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status ' + type;
}