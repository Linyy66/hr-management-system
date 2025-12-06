// main page: read credentials from localStorage, call /api/auth/me, show panels based on role
(async function(){
    const title = document.getElementById('title');
    const userInfo = document.getElementById('userInfo');
    const adminPanel = document.getElementById('adminPanel');
    const hrPanel = document.getElementById('hrPanel');
    const empPanel = document.getElementById('employeePanel');
    const empWelcome = document.getElementById('empWelcome');
    const btnLogout = document.getElementById('btnLogout');

    function getCreds(){
        const s = localStorage.getItem('hrms_auth');
        if(!s) return null;
        try{ return JSON.parse(s);}catch(e){return null;}
    }
    function authHeader(){
        const c = getCreds();
        if(!c) return {'Content-Type':'application/json'};
        return {'Authorization':'Basic '+btoa(c.u+':'+c.p),'Content-Type':'application/json'};
    }

    async function showRole(){
        const c = getCreds();
        if(!c){
            userInfo.textContent = '未登录，请返回登录页面';
            return;
        }
        try{
            const res = await fetch('/api/auth/me', { headers: authHeader() });
            if(!res.ok){
                userInfo.textContent = '获取用户信息失败：' + res.status;
                return;
            }
            const json = await res.json();
            const uname = json.username;
            const role = json.role;
            userInfo.textContent = `当前用户： ${uname}（${role}）`;
            title.textContent = `HRMS - ${role} 界面`;
            // show appropriate panel
            adminPanel.classList.add('hidden');
            hrPanel.classList.add('hidden');
            empPanel.classList.add('hidden');

            if(role === 'ADMIN'){
                adminPanel.classList.remove('hidden');
            } else if(role === 'HR_SPEC' || role === 'HR_MANAGER'){
                hrPanel.classList.remove('hidden');
            } else if(role === 'EMPLOYEE'){
                empPanel.classList.remove('hidden');
                empWelcome.innerHTML = `<p>欢迎员工 ${uname} ，您已登录员工界面。</p>`;
            } else {
                userInfo.textContent += '（未知角色）';
            }
        }catch(e){
            userInfo.textContent = '请求失败：' + e.message;
        }
    }

    // admin create user button
    document.getElementById('adm_create')?.addEventListener('click', async ()=>{
        const uname = document.getElementById('adm_user').value.trim();
        const pass = document.getElementById('adm_pass').value;
        const role = document.getElementById('adm_role').value;
        const status = document.getElementById('adm_status');
        status.textContent = '';
        if(!uname||!pass) return status.textContent='用户名/密码必填';
        try{
            // admin must be authenticated; credentials stored in localStorage
            const res = await fetch('/api/auth/register', {
                method:'POST',
                headers: authHeader(),
                body: JSON.stringify({username:uname,password:pass,role:role})
            });
            if(res.ok){
                const j = await res.json();
                status.style.color='green';
                status.textContent = '创建成功: ' + JSON.stringify(j);
            } else {
                const t = await res.text();
                status.style.color='darkred';
                status.textContent = '创建失败: ' + res.status + ' ' + t;
            }
        }catch(e){
            status.style.color='darkred';
            status.textContent = '请求错误: ' + e.message;
        }
    });

    // HR panel buttons
    document.getElementById('btnListOrgs')?.addEventListener('click', async ()=>{
        const el = document.getElementById('orgResult');
        el.textContent = '加载中...';
        try{
            const res = await fetch('/api/org1', { headers: authHeader() });
            if(res.ok) el.textContent = JSON.stringify(await res.json(), null, 2);
            else el.textContent = '错误: ' + res.status + ' ' + await res.text();
        }catch(e){ el.textContent = '请求失败: '+e.message;}
    });

    document.getElementById('btnListStaff')?.addEventListener('click', async ()=>{
        const el = document.getElementById('staffResult');
        el.textContent = '加载中...';
        try{
            const res = await fetch('/api/staff', { headers: authHeader() });
            if(res.ok) el.textContent = JSON.stringify(await res.json(), null, 2);
            else el.textContent = '错误: ' + res.status + ' ' + await res.text();
        }catch(e){ el.textContent = '请求失败: '+e.message;}
    });

    btnLogout.addEventListener('click', ()=>{
        localStorage.removeItem('hrms_auth');
        location.href = '/login.html';
    });

    // init show role
    showRole();
})();