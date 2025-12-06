// 登录验证
function authLogin() {
    const username = document.getElementById('login-username').value.trim(); // 去除首尾空格
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    // 清空之前的错误信息
    errorEl.textContent = '';

    // 输入校验
    if (!username) {
        errorEl.textContent = '请输入用户名';
        return;
    }
    if (!password) {
        errorEl.textContent = '请输入密码';
        return;
    }

    try {
        // 核心修复：简化Basic Auth凭证生成（避免过度编码导致后端解析失败）
        // 直接拼接用户名密码，btoa原生支持ASCII字符（测试账号无特殊字符）
        const rawAuthStr = `${username}:${password}`;
        const authStr = btoa(rawAuthStr);
        localStorage.setItem('hrms_auth', authStr);
        localStorage.setItem('hrms_user', username);

        // 验证凭证有效性（调用员工接口）
        fetch('/api/staff', {
            method: 'GET', // 明确指定请求方法
            headers: {
                'Authorization': `Basic ${authStr}`,
                'Accept': 'application/json', // 声明期望的响应格式
                'Content-Type': 'application/json;charset=UTF-8', // 强制UTF-8编码
                'X-Requested-With': 'XMLHttpRequest' // 标识AJAX请求，避免后端误判
            },
            credentials: 'same-origin', // 确保同域凭证传递
            cache: 'no-cache' // 禁用缓存，避免旧凭证干扰
        }).then(async (res) => {
            // 处理HTTP错误状态码
            if (!res.ok) {
                // 获取后端返回的具体错误信息（适配后端自定义的403提示）
                let errorMsg = '用户名或密码错误';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorMsg; // 优先使用后端返回的错误信息
                } catch (e) {
                    // 按状态码细分错误提示（适配后端权限规则）
                    if (res.status === 403) {
                        errorMsg = '权限不足！请使用人事专员/经理/管理员账号登录';
                    } else if (res.status === 401) {
                        errorMsg = '认证失败！请检查账号密码是否正确';
                    } else if (res.status === 404) {
                        errorMsg = '接口未找到！请确认后端/api/staff接口已实现';
                    } else {
                        errorMsg = `登录失败（状态码：${res.status}）`;
                    }
                }
                errorEl.textContent = errorMsg;
                localStorage.clear(); // 清除无效凭证
                return;
            }

            // 登录成功，跳转主页面（强制刷新避免缓存）
            window.location.replace('main.html');
        }).catch((err) => {
            console.error('登录请求失败详情:', err); // 控制台打印错误详情，方便调试
            // 细分网络错误提示
            if (err.message.includes('Failed to fetch')) {
                errorEl.textContent = '系统连接失败！请检查后端服务是否启动（端口8080）';
            } else {
                errorEl.textContent = '请求异常！请刷新页面重试';
            }
            localStorage.clear();
        });
    } catch (err) {
        console.error('凭证生成失败详情:', err);
        // 捕获btoa编码异常（如用户名含非ASCII字符）
        if (err.message.includes('btoa')) {
            errorEl.textContent = '用户名/密码包含特殊字符，暂不支持';
        } else {
            errorEl.textContent = '登录过程异常，请重试';
        }
    }
}

// 退出登录
function authLogout() {
    // 清除本地存储的认证信息
    localStorage.removeItem('hrms_auth');
    localStorage.removeItem('hrms_user');
    // 强制跳转登录页（避免缓存页面）
    window.location.replace('login.html');
}

// 获取认证请求头（供其他模块调用）
function getAuthHeader() {
    const authStr = localStorage.getItem('hrms_auth');
    // 未登录时返回空对象（避免请求头格式错误）
    if (!authStr) return {};
    return {
        'Authorization': `Basic ${authStr}`,
        'Content-Type': 'application/json;charset=UTF-8', // 统一UTF-8编码
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // 标识AJAX请求
    };
}

// 新增：页面加载时自动清除无效凭证（可选，解决缓存导致的登录异常）
window.onload = function() {
    const authStr = localStorage.getItem('hrms_auth');
    if (authStr) {
        // 验证本地凭证是否有效，无效则清除
        fetch('/api/staff', {
            method: 'GET',
            headers: getAuthHeader()
        }).catch(() => {
            localStorage.clear();
        });
    }
}