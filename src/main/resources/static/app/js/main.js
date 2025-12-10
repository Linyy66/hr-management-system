// main page: admin role & user management + HR/Employee panels
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
                await loadRoles();
                await populateRoleSelect();
                await loadUsers();
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

    // ----- role table -----
    async function loadRoles(){
        const tbody = document.querySelector('#roleTable tbody');
        tbody.innerHTML = '<tr><td colspan="3">加载中...</td></tr>';
        try{
            const res = await fetch('/api/roles', { headers: authHeader() });
            if(!res.ok){
                tbody.innerHTML = `<tr><td colspan="3">加载失败: ${res.status}</td></tr>`;
                return;
            }
            const roles = await res.json();
            if(!Array.isArray(roles) || roles.length === 0){
                tbody.innerHTML = '<tr><td colspan="3">暂无角色</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            roles.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td style="padding:8px">${r.id}</td>
                        <td style="padding:8px">${r.name}</td>
                        <td style="padding:8px">
                          <button data-id="${r.id}" class="btn-delete-role secondary">删除</button>
                        </td>`;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.btn-delete-role').forEach(b=>{
                b.addEventListener('click', async ()=>{
                    const id = b.dataset.id;
                    if(!confirm('确认删除此角色？')) return;
                    try{
                        const resp = await fetch('/api/roles/' + id, { method:'DELETE', headers: authHeader() });
                        if(resp.status === 204){
                            document.getElementById('roleStatus').textContent = '删除成功';
                            loadRoles();
                            populateRoleSelect();
                            loadUsers();
                        } else {
                            const text = await resp.text();
                            document.getElementById('roleStatus').textContent = '删除失败: ' + resp.status + ' ' + text;
                        }
                    }catch(e){
                        document.getElementById('roleStatus').textContent = '请求失败: ' + e.message;
                    }
                });
            });
        }catch(e){
            tbody.innerHTML = '<tr><td colspan="3">请求失败</td></tr>';
        }
    }

    async function addRole(){
        const input = document.getElementById('newRoleName');
        const name = input.value.trim();
        const status = document.getElementById('roleStatus');
        status.textContent = '';
        if(!name) { status.textContent = '请输入角色名'; return; }
        try{
            const res = await fetch('/api/roles', {
                method:'POST',
                headers: authHeader(),
                body: JSON.stringify({name})
            });
            if(res.ok){
                status.style.color='green';
                status.textContent = '添加成功';
                input.value = '';
                await loadRoles();
                await populateRoleSelect();
            } else {
                const t = await res.text();
                status.style.color='darkred';
                status.textContent = '添加失败: ' + res.status + ' ' + t;
            }
        }catch(e){
            status.style.color='darkred';
            status.textContent = '请求错误: ' + e.message;
        }
    }

    async function populateRoleSelect(){
        const sel = document.getElementById('adm_role');
        sel.innerHTML = '';
        try{
            const res = await fetch('/api/roles', { headers: authHeader() });
            if(!res.ok) return;
            const roles = await res.json();
            roles.sort((a,b)=> a.name === 'EMPLOYEE' ? -1 : a.name.localeCompare(b.name));
            roles.forEach(r=>{
                const opt = document.createElement('option');
                opt.value = r.name;
                opt.textContent = r.name;
                sel.appendChild(opt);
            });
        }catch(e){}
    }

    // ----- user table -----
    async function loadUsers(){
        const tbody = document.querySelector('#userTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';
        try{
            const res = await fetch('/api/users', { headers: authHeader() });
            if(!res.ok){
                tbody.innerHTML = `<tr><td colspan="4">加载失败: ${res.status}</td></tr>`;
                return;
            }
            const users = await res.json();
            if(!Array.isArray(users) || users.length === 0){
                tbody.innerHTML = '<tr><td colspan="4">暂无用户</td></tr>';
                return;
            }
            // get roles for select
            const rolesRes = await fetch('/api/roles', { headers: authHeader() });
            const roles = rolesRes.ok ? await rolesRes.json() : [];
            tbody.innerHTML = '';
            users.forEach(u=>{
                const tr = document.createElement('tr');
                const roleOptions = roles.map(r => `<option value="${r.name}" ${r.name === u.role ? 'selected' : ''}>${r.name}</option>`).join('');
                tr.innerHTML = `<td style="padding:8px">${u.username}</td>
                        <td style="padding:8px">
                          <select class="user-role-select">${roleOptions}</select>
                        </td>
                        <td style="padding:8px">
                          <input type="checkbox" class="user-enabled" ${u.enabled ? 'checked' : ''} />
                        </td>
                        <td style="padding:8px">
                          <button class="btn-save-user">保存</button>
                          <button class="btn-delete-user secondary">删除</button>
                        </td>`;
                tbody.appendChild(tr);

                // attach handlers
                const saveBtn = tr.querySelector('.btn-save-user');
                const delBtn = tr.querySelector('.btn-delete-user');
                const roleSel = tr.querySelector('.user-role-select');
                const enabledChk = tr.querySelector('.user-enabled');

                saveBtn.addEventListener('click', async ()=>{
                    const payload = { role: roleSel.value, enabled: enabledChk.checked };
                    // also if admin entered a password? For simplicity, no inline password change here.
                    try{
                        const resp = await fetch('/api/users/' + encodeURIComponent(u.username), {
                            method:'PUT',
                            headers: authHeader(),
                            body: JSON.stringify(payload)
                        });
                        if(resp.ok){
                            document.getElementById('userStatus').textContent = '保存成功';
                            loadUsers();
                        } else {
                            const t = await resp.text();
                            document.getElementById('userStatus').textContent = '保存失败: ' + resp.status + ' ' + t;
                        }
                    }catch(e){
                        document.getElementById('userStatus').textContent = '请求错误: ' + e.message;
                    }
                });

                delBtn.addEventListener('click', async ()=>{
                    if(u.username === 'admin'){ alert('禁止删除 admin'); return; }
                    if(!confirm('确认删除用户 ' + u.username + ' ?')) return;
                    try{
                        const resp = await fetch('/api/users/' + encodeURIComponent(u.username), {
                            method:'DELETE',
                            headers: authHeader()
                        });
                        if(resp.status === 204){
                            document.getElementById('userStatus').textContent = '删除成功';
                            loadUsers();
                            populateRoleSelect();
                        } else {
                            const t = await resp.text();
                            document.getElementById('userStatus').textContent = '删除失败: ' + resp.status + ' ' + t;
                        }
                    }catch(e){
                        document.getElementById('userStatus').textContent = '请求错误: ' + e.message;
                    }
                });
            });
        }catch(e){
            tbody.innerHTML = '<tr><td colspan="4">请求失败</td></tr>';
        }
    }

    // ----- admin create user -----
    document.getElementById('adm_create')?.addEventListener('click', async ()=>{
        const uname = document.getElementById('adm_user').value.trim();
        const pass = document.getElementById('adm_pass').value;
        const role = document.getElementById('adm_role').value;
        const status = document.getElementById('adm_status');
        status.textContent = '';
        if(!uname||!pass) return status.textContent='用户名/密码必填';
        try{
            const res = await fetch('/api/users', {
                method:'POST',
                headers: authHeader(),
                body: JSON.stringify({username:uname,password:pass,role:role})
            });
            if(res.ok){
                const j = await res.json();
                status.style.color='green';
                status.textContent = '创建成功: ' + JSON.stringify(j);
                document.getElementById('adm_user').value='';
                document.getElementById('adm_pass').value='';
                await loadUsers();
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

    // HR panel buttons (unchanged)
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

    document.getElementById('btnAddRole')?.addEventListener('click', addRole);

    // init
    showRole();
})();