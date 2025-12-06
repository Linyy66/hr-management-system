// 简单 auth helper for Basic Auth + admin register
(function () {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginStatus = document.getElementById('loginStatus');

    const regSection = document.getElementById('registerSection');
    const regUsername = document.getElementById('reg_username');
    const regPassword = document.getElementById('reg_password');
    const regRole = document.getElementById('reg_role');
    const registerStatus = document.getElementById('registerStatus');

    const apiResult = document.getElementById('apiResult');

    let savedCreds = null;

    function setStatus(el, msg, ok = true) {
        el.textContent = msg;
        el.style.color = ok ? 'green' : 'darkred';
    }

    function authHeader() {
        const headers = { 'Content-Type': 'application/json' };
        if (savedCreds && savedCreds.u) {
            const token = btoa(savedCreds.u + ':' + savedCreds.p);
            headers['Authorization'] = 'Basic ' + token;
        }
        return headers;
    }

    document.getElementById('btnSaveCreds').addEventListener('click', async () => {
        const u = usernameInput.value.trim();
        const p = passwordInput.value;
        if (!u || !p) return setStatus(loginStatus, '请输入用户名与密码', false);
        savedCreds = { u, p };
        // test with /api/org1 (requires auth)
        try {
            const res = await fetch('/api/org1', { method: 'GET', headers: authHeader() });
            if (res.status === 200) {
                setStatus(loginStatus, '已保存凭证并成功连接后端');
                // show register section only for admin
                if (savedCreds.u === 'admin') {
                    regSection.classList.remove('hidden');
                } else {
                    regSection.classList.add('hidden');
                }
            } else if (res.status === 401) {
                setStatus(loginStatus, '认证失败：用户名或密码错误', false);
                regSection.classList.add('hidden');
            } else {
                setStatus(loginStatus, '已保存凭证，但连接返回状态：' + res.status, false);
                regSection.classList.add('hidden');
            }
        } catch (e) {
            setStatus(loginStatus, '连接失败: ' + e.message, false);
            regSection.classList.add('hidden');
        }
    });

    document.getElementById('btnRegister').addEventListener('click', async () => {
        if (!savedCreds) return setStatus(registerStatus, '请先保存管理员凭证', false);
        const payload = {
            username: regUsername.value.trim(),
            password: regPassword.value,
            role: regRole.value
        };
        if (!payload.username || !payload.password) return setStatus(registerStatus, '用户名/密码必填', false);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: authHeader(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(registerStatus, '注册成功: ' + JSON.stringify(data));
            } else {
                const text = await res.text();
                setStatus(registerStatus, '注册失败: ' + res.status + ' ' + text, false);
            }
        } catch (e) {
            setStatus(registerStatus, '注册请求失败: ' + e.message, false);
        }
    });

    document.getElementById('btnListUsers').addEventListener('click', async () => {
        if (!savedCreds) return apiResult.textContent = '请先保存管理员或其它用户凭证';
        try {
            const res = await fetch('/api/staff', { method: 'GET', headers: authHeader() });
            if (res.ok) {
                const json = await res.json();
                apiResult.textContent = JSON.stringify(json, null, 2);
            } else {
                apiResult.textContent = 'HTTP ' + res.status + ' ' + (await res.text());
            }
        } catch (e) {
            apiResult.textContent = '请求失败: ' + e.message;
        }
    });

})();