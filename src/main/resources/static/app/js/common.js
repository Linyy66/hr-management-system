// 公共工具函数
function getAuthHeader() {
    const creds = JSON.parse(localStorage.getItem('hrms_auth') || '{}');
    if (!creds.u || !creds.p) return {};
    return {
        'Authorization': 'Basic ' + btoa(creds.u + ':' + creds.p),
        'Content-Type': 'application/json'
    };
}

// 显示指定面板，隐藏其他面板
function showPane(paneId) {
    document.querySelectorAll('.pane').forEach(pane => {
        pane.classList.add('hidden');
    });
    const target = document.getElementById(paneId);
    if (target) {
        target.classList.remove('hidden');
    }
}

// 检查是否管理员权限
function isAdmin() {
    const creds = JSON.parse(localStorage.getItem('hrms_auth') || '{}');
    return creds.u === 'admin';
}

// 统一处理API请求
async function apiRequest(url, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: getAuthHeader()
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP状态: ${res.status}`);
        return await res.json();
    } catch (error) {
        alert(`操作失败: ${error.message}`);
        return null;
    }
}