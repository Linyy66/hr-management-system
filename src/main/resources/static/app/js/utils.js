/**
 * 通用工具库
 */

// 工具类函数库

// 格式化日期
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期时间
function formatDateTime(dateTime) {
    if (!dateTime) return '';
    const d = new Date(dateTime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 显示消息
function showMessage(message, type = 'info') {
    // 在实际应用中，可以创建一个消息提示框来显示消息
    alert(`${type.toUpperCase()}: ${message}`);
}

// 表单验证
const FormValidator = {
    // 验证必填字段
    required(value) {
        return value && value.trim().length > 0;
    },
    
    // 验证邮箱格式
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // 验证手机号格式
    mobile(mobile) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(mobile);
    },
    
    // 验证身份证号格式
    idCard(idCard) {
        const re = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        return re.test(idCard);
    }
};

// 获取URL参数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 设置本地存储
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to set local storage:', e);
    }
}

// 获取本地存储
function getLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.error('Failed to get local storage:', e);
        return null;
    }
}