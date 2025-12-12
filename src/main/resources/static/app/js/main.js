// main.js - role-based left menu and per-function panes (extended: attendance & leave)
(async function(){
    const getCreds = () => {
        const s = localStorage.getItem('hrms_auth');
        if(!s) return null;
        try { return JSON.parse(s); } catch(e){ return null; }
    };
    const authHeader = () => {
        const c = getCreds();
        const h = {'Content-Type':'application/json'};
        if(c && c.u) h['Authorization'] = 'Basic ' + btoa(c.u + ':' + c.p);
        return h;
    };

    // DOM refs
    const userInfo = document.getElementById('userInfo');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const sideMenu = document.getElementById('sideMenu');
    const btnLogout = document.getElementById('btnLogout');

    // menu config (same as earlier) but include attendance/leave panes in EMPLOYEE and HR_SPEC leave approvals
    const MENU_CONFIG = {
        ADMIN: [
            { label: '角色管理', items: [{id:'admin.roles', title:'角色管理'}] },
            { label: '账号管理', items: [{id:'admin.users', title:'账号管理'}] }
        ],
        HR_SPEC: [
            { label: '员工管理', items: [{id:'hrSpec.employees', title:'已注册员工'}] },
            { label: '简历与审批', items: [{id:'hrSpec.resumes', title:'简历审批'}] },
            { label: '请假审批', items: [{id:'hrSpec.leaves', title:'请假审批'}] }
        ],
        HR_MANAGER: [
            { label: '报表', items: [{id:'hrManager.reports', title:'企业人力报表'}] },
            { label: '审批决策', items: [{id:'hrManager.approvals', title:'审批列表'},{id:'hrManager.staff', title:'员工列表'}] }
        ],
        EMPLOYEE: [
            { label: '职位与投递', items: [{id:'employee.jobs', title:'职位列表'},{id:'employee.resumes', title:'我的投递'}] },
            { label: '个人/简历', items: [{id:'employee.profile', title:'编辑简历'}] },
            { label: '考勤/请假', items: [{id:'employee.attendance', title:'考勤打卡'},{id:'employee.leave', title:'请假申请'}] }
        ]
    };

    // show pane by id
    function showPane(paneId) {
        document.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));
        const pane = document.getElementById(paneId);
        if(!pane) return;
        pane.classList.remove('hidden');
        pageTitle.textContent = pane.querySelector('h3') ? pane.querySelector('h3').textContent : '页面';
        pageSubtitle.textContent = '';
        const fn = INIT_HANDLERS[paneId];
        if (typeof fn === 'function') { try { fn(); } catch(e) { console.error(e); } }
    }

    function buildSideMenu(role) {
        sideMenu.innerHTML = '';
        const cfg = MENU_CONFIG[role] || [];
        cfg.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'menu-group';
            const titleEl = document.createElement('div');
            titleEl.className = 'menu-group-title';
            titleEl.textContent = group.label;
            groupEl.appendChild(titleEl);
            const ul = document.createElement('ul');
            ul.className = 'menu-items';
            group.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                li.textContent = item.title;
                li.dataset.pane = item.id;
                li.addEventListener('click', () => {
                    document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
                    li.classList.add('active');
                    showPane(item.id);
                });
                ul.appendChild(li);
            });
            groupEl.appendChild(ul);
            sideMenu.appendChild(groupEl);
        });
        const first = sideMenu.querySelector('.menu-item');
        if(first) first.click();
    }

    // init handlers map
    const INIT_HANDLERS = {
        'admin.roles': async ()=> await loadRoles(),
        'admin.users': async ()=> { await populateRoleSelect(); await loadUsers(); },

        'hrSpec.employees': async ()=> await loadEmployees(),
        'hrSpec.resumes': async ()=> await loadResumes(),
        'hrSpec.leaves': async ()=> await loadLeaveRequests(),

        'hrManager.reports': async ()=> await loadReport(),
        'hrManager.approvals': async ()=> await loadApprovals(),
        'hrManager.staff': async ()=> await refreshMgrStaff(),

        'employee.jobs': async ()=> await loadPositionsInto('#empPositionsTable','empPosSearch', true),
        'employee.resumes': async ()=> await loadMyResumes(),
        'employee.profile': async ()=> await initEmployeeForm(),
        'employee.attendance': async ()=> { await populateAttendancePositions(); await loadMyAttendance(); },
        'employee.leave': async ()=> { await loadMyLeaves(); }
    };

    async function ensureAuthOrRedirect() {
        const c = getCreds();
        if(!c) { location.href = '/login.html'; return false; }
        try {
            const res = await fetch('/api/auth/me', { headers: authHeader() });
            if(res.ok) return true;
        } catch(e){}
        localStorage.removeItem('hrms_auth');
        location.href = '/login.html';
        return false;
    }

    async function showRoleAndMenu() {
        if(!await ensureAuthOrRedirect()) return;
        const res = await fetch('/api/auth/me', { headers: authHeader() });
        if(!res.ok){ localStorage.removeItem('hrms_auth'); location.href = '/login.html'; return; }
        const me = await res.json();
        userInfo.textContent = `${me.username}（${me.role}）`;
        document.getElementById('appTitle').textContent = 'HRMS - ' + me.role;
        buildSideMenu(me.role);
    }

    btnLogout.addEventListener('click', ()=>{ localStorage.removeItem('hrms_auth'); location.href = '/login.html'; });

    // ---------- ADMIN helpers ----------
    async function loadRoles(){
        const tbody = document.querySelector('#roleTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="3">加载中...</td></tr>';
        try{
            const res = await fetch('/api/roles', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="3">加载失败</td></tr>'; return; }
            const roles = await res.json();
            tbody.innerHTML = '';
            roles.forEach(r=>{
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${r.id}</td><td>${r.name}</td><td><button data-id="${r.id}" class="btn-delete-role secondary">删除</button></td>`;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.btn-delete-role').forEach(b=>{
                b.addEventListener('click', async ()=> {
                    if(!confirm('确认删除角色？')) return;
                    const id = b.dataset.id;
                    try{
                        const resp = await fetch('/api/roles/' + id, { method:'DELETE', headers: authHeader() });
                        if(resp.status===204) loadRoles(); else alert('删除失败: ' + await resp.text());
                    }catch(e){ alert('请求失败'); }
                });
            });
        }catch(e){ tbody.innerHTML = '<tr><td colspan="3">请求失败</td></tr>'; }
    }
    document.getElementById('btnAddRole')?.addEventListener('click', async ()=>{
        const name = document.getElementById('newRoleName').value.trim();
        if(!name){ document.getElementById('roleStatus').textContent='请输入角色名'; return; }
        try{
            const res = await fetch('/api/roles', { method:'POST', headers: authHeader(), body: JSON.stringify({name}) });
            if(res.ok){ document.getElementById('roleStatus').textContent='添加成功'; document.getElementById('newRoleName').value=''; loadRoles(); populateRoleSelect(); }
            else { document.getElementById('roleStatus').textContent = '添加失败: ' + await res.text(); }
        }catch(e){ document.getElementById('roleStatus').textContent='请求失败'; }
    });

    async function populateRoleSelect(){
        const sel = document.getElementById('adm_role');
        if(!sel) return;
        sel.innerHTML = '';
        try{
            const res = await fetch('/api/roles', { headers: authHeader() });
            if(!res.ok) return;
            const roles = await res.json();
            roles.forEach(r => { const opt = document.createElement('option'); opt.value = r.name; opt.textContent = r.name; sel.appendChild(opt); });
        }catch(e){}
    }

    document.getElementById('adm_create')?.addEventListener('click', async ()=>{
        const uname = document.getElementById('adm_user').value.trim();
        const pass = document.getElementById('adm_pass').value;
        const role = document.getElementById('adm_role').value;
        if(!uname||!pass){ document.getElementById('adm_status').textContent='用户名/密码必填'; return; }
        try{
            const res = await fetch('/api/users', { method:'POST', headers: authHeader(), body: JSON.stringify({username:uname,password:pass,role}) });
            if(res.ok){ document.getElementById('adm_status').textContent='创建成功'; document.getElementById('adm_user').value=''; document.getElementById('adm_pass').value=''; loadUsers(); }
            else { document.getElementById('adm_status').textContent='创建失败: '+ await res.text(); }
        }catch(e){ document.getElementById('adm_status').textContent='请求失败'; }
    });

    async function loadUsers(){
        const tbody = document.querySelector('#userTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';
        try{
            const res = await fetch('/api/users', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>'; return; }
            const users = await res.json();
            const rolesRes = await fetch('/api/roles', { headers: authHeader() });
            const roles = rolesRes.ok ? await rolesRes.json() : [];
            tbody.innerHTML = '';
            users.forEach(u=>{
                const roleOptions = roles.map(r=>`<option value="${r.name}" ${r.name===u.role?'selected':''}>${r.name}</option>`).join('');
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${u.username}</td><td><select class="user-role-select">${roleOptions}</select></td>
                        <td><input type="checkbox" class="user-enabled" ${u.enabled ? 'checked' : ''} /></td>
                        <td><button class="btn-save-user">保存</button> <button class="btn-delete-user secondary">删除</button></td>`;
                tbody.appendChild(tr);

                const saveBtn = tr.querySelector('.btn-save-user');
                const delBtn = tr.querySelector('.btn-delete-user');
                const roleSel = tr.querySelector('.user-role-select');
                const enabledChk = tr.querySelector('.user-enabled');

                saveBtn.addEventListener('click', async ()=>{
                    try{
                        const resp = await fetch('/api/users/' + encodeURIComponent(u.username), { method:'PUT', headers: authHeader(), body: JSON.stringify({role: roleSel.value, enabled: enabledChk.checked}) });
                        if(resp.ok) { document.getElementById('userStatus').textContent='保存成功'; loadUsers(); } else { document.getElementById('userStatus').textContent='保存失败: '+await resp.text(); }
                    }catch(e){ document.getElementById('userStatus').textContent='请求失败'; }
                });

                delBtn.addEventListener('click', async ()=>{
                    if(u.username === 'admin'){ alert('禁止删除 admin'); return; }
                    if(!confirm('确认删除用户 ' + u.username + ' ?')) return;
                    try{
                        const resp = await fetch('/api/users/' + encodeURIComponent(u.username), { method:'DELETE', headers: authHeader() });
                        if(resp.status===204){ document.getElementById('userStatus').textContent='删除成功'; loadUsers(); } else { document.getElementById('userStatus').textContent='删除失败: '+await resp.text(); }
                    }catch(e){ document.getElementById('userStatus').textContent='请求失败'; }
                });
            });
        }catch(e){ tbody.innerHTML = '<tr><td colspan="4">请求失败</td></tr>'; }
    }

    // ---------- HR_SPEC ----------
    async function loadEmployees(){
        const tbody = document.querySelector('#employeesTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';
        try{
            const res = await fetch('/api/users/employees', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>'; return; }
            const list = await res.json();
            const search = document.getElementById('empSearch')?.value.trim().toLowerCase() || '';
            const filtered = list.filter(u => !search || u.username.toLowerCase().includes(search));
            tbody.innerHTML = '';
            filtered.forEach(u=>{
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${u.username}</td><td>${u.role}</td><td>${u.enabled ? '是' : '否'}</td><td><button class="btn-create-staff">建档</button></td>`;
                tbody.appendChild(tr);
                tr.querySelector('.btn-create-staff').addEventListener('click', ()=> { document.getElementById('create_user').value = u.username; document.getElementById('create_archiveId').focus(); });
            });
        }catch(e){ tbody.innerHTML = '<tr><td colspan="4">请求失败</td></tr>'; }
    }
    document.getElementById('btnRefreshEmployees')?.addEventListener('click', loadEmployees);

    // resumes: list with view/approve/reject
    async function loadResumes(){
        const tbody = document.querySelector('#resumesTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';
        try{
            const res = await fetch('/api/resumes', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="5">加载失败</td></tr>'; return; }
            const list = await res.json();
            const filter = document.getElementById('resumeFilter')?.value || 'ALL';
            const filtered = list.filter(r => filter==='ALL' ? true : r.status === filter);
            tbody.innerHTML = '';
            filtered.forEach(r=>{
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${r.id}</td><td>${r.username}</td><td>${r.appliedPositionIds||''}</td><td>${r.status}</td>
                        <td><button class="btn-view-resume" data-id="${r.id}">查看信息</button> <button class="btn-approve" data-id="${r.id}">通过</button> <button class="btn-reject" data-id="${r.id}">驳回</button></td>`;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.btn-view-resume').forEach(b => b.addEventListener('click', async ()=>{
                const id = b.dataset.id;
                const res = await fetch('/api/resumes/' + id, { headers: authHeader() });
                if(!res.ok){ alert('无法获取'); return; }
                const data = await res.json();
                const info = `姓名: ${data.fullName||''}\n性别: ${data.gender||''}\n民族: ${data.ethnicity||''}\n学历: ${data.education||''}\n特长: ${data.specialties||data.skills||''}\n手机号: ${data.mobile||''}\n邮箱: ${data.email||''}\n经历: ${data.experience||''}`;
                alert(info);
            }));
            document.querySelectorAll('.btn-approve').forEach(b=> b.addEventListener('click', async ()=> {
                const id = b.dataset.id;
                const res = await fetch('/api/resumes/' + id + '/approve', { method:'PUT', headers: authHeader() });
                if(res.ok){ loadResumes(); loadEmployees(); } else alert('失败:'+await res.text());
            }));
            document.querySelectorAll('.btn-reject').forEach(b=> b.addEventListener('click', async ()=> {
                const id = b.dataset.id;
                const res = await fetch('/api/resumes/' + id + '/reject', { method:'PUT', headers: authHeader() });
                if(res.ok){ loadResumes(); } else alert('失败:'+await res.text());
            }));
        }catch(e){ tbody.innerHTML = '<tr><td colspan="5">请求失败</td></tr>'; }
    }
    document.getElementById('btnRefreshResumes')?.addEventListener('click', loadResumes);

    // HR_SPEC create staff (as before)
    document.getElementById('btnCreateStaff')?.addEventListener('click', async ()=>{
        const username = document.getElementById('create_user').value.trim();
        const archiveId = document.getElementById('create_archiveId').value.trim();
        const positionId = document.getElementById('create_positionId').value.trim();
        const statusEl = document.getElementById('createStaffStatus');
        statusEl.textContent = '';
        if(!username||!archiveId){ statusEl.textContent='用户名/档案ID必填'; return; }
        try{
            const res = await fetch(`/api/users/${encodeURIComponent(username)}/create-staff`, { method:'POST', headers: authHeader(), body: JSON.stringify({archiveId, positionId, staffName: username, mobile: ''}) });
            if(res.ok){ statusEl.style.color='green'; statusEl.textContent='建档成功'; loadEmployees(); } else { statusEl.style.color='darkred'; statusEl.textContent='失败: '+await res.text(); }
        }catch(e){ statusEl.style.color='darkred'; statusEl.textContent='请求失败'; }
    });

    // ---------- HR_MANAGER (reports & approvals) ----------
    async function fetchReport() {
        const res = await fetch('/api/reports/summary', { headers: authHeader() });
        if(!res.ok) throw new Error('无法获取报表: ' + res.status);
        return res.json();
    }
    async function loadReport() {
        const out = document.getElementById('reportResult');
        if(!out) return;
        out.textContent = '加载中...';
        try {
            const r = await fetchReport();
            let txt = `员工总数: ${r.totalEmployees}\n流失数: ${r.leftCount}\n流失率: ${r.turnoverRate}%\n\n按职称:\n`;
            for(const [k,v] of Object.entries(r.byTitle || {})) { txt += `  ${k}: ${v}\n`; }
            txt += '\n用户角色统计:\n';
            for(const [k,v] of Object.entries(r.usersByRole || {})) { txt += `  ${k}: ${v}\n`; }
            out.textContent = txt;
        } catch(e) { out.textContent = '加载失败: ' + e.message; }
    }
    document.getElementById('btnLoadReport')?.addEventListener('click', loadReport);

    async function loadApprovals() {
        const tbody = document.querySelector('#mgrApprovalsTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6">加载中...</td></tr>';
        try {
            const res = await fetch('/api/approvals', { headers: authHeader() });
            if(!res.ok) { tbody.innerHTML = '<tr><td colspan="6">加载失败</td></tr>'; return; }
            const list = await res.json();
            const filter = document.getElementById('mgrApprovalFilter')?.value || 'ALL';
            const filtered = list.filter(a => filter === 'ALL' ? true : a.status === filter);
            if(filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="6">暂无审批事项</td></tr>'; return; }
            tbody.innerHTML = '';
            filtered.forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${a.id}</td><td>${a.type}</td><td>${a.submitter}</td><td>${a.submitTime ? new Date(a.submitTime).toLocaleString() : ''}</td><td>${a.status}</td>
                        <td><button class="mgr-view" data-id="${a.id}">查看</button> ${a.status==='PENDING'?'<button class="mgr-approve" data-id="'+a.id+'">通过</button> <button class="mgr-reject secondary" data-id="'+a.id+'">驳回</button>':''}</td>`;
                tbody.appendChild(tr);
            });
            // handlers as before...
            document.querySelectorAll('.mgr-view').forEach(b => b.addEventListener('click', async () => {
                const id = b.dataset.id;
                let item = null;
                try { const single = await fetch('/api/approvals/' + id, { headers: authHeader() }); if(single.ok) item = await single.json(); } catch(e){}
                if(!item) { const r = await fetch('/api/approvals', { headers: authHeader() }); const data = await r.json(); item = data.find(x => String(x.id) === String(id)); }
                if(!item) return alert('未找到');
                alert(`审批 #${item.id}\n类型: ${item.type}\n提交者: ${item.submitter}\n状态: ${item.status}\n时间: ${item.submitTime}\n\n详情(payload):\n${item.payload}`);
            }));
            document.querySelectorAll('.mgr-approve').forEach(b => b.addEventListener('click', async () => {
                const id = b.dataset.id; if(!confirm('确认通过此方案？')) return;
                try { const res = await fetch('/api/approvals/' + id + '/approve', { method:'PUT', headers: authHeader() }); if(res.ok) { loadApprovals(); document.getElementById('mgrApprovalStatus').textContent = '已通过'; } else { alert('批准失败: ' + await res.text()); } } catch(e) { alert('请求失败: ' + e.message); }
            }));
            document.querySelectorAll('.mgr-reject').forEach(b => b.addEventListener('click', async () => {
                const id = b.dataset.id; if(!confirm('确认驳回此方案？')) return;
                try { const res = await fetch('/api/approvals/' + id + '/reject', { method:'PUT', headers: authHeader() }); if(res.ok) { loadApprovals(); document.getElementById('mgrApprovalStatus').textContent = '已驳回'; } else { alert('驳回失败: ' + await res.text()); } } catch(e) { alert('请求失败: ' + e.message); }
            }));
        } catch(e) { tbody.innerHTML = '<tr><td colspan="6">请求失败</td></tr>'; }
    }

    // manager staff functions (unchanged)
    async function fetchStaff(){ const res = await fetch('/api/staff', { headers: authHeader() }); if(!res.ok) throw new Error('Fetch staff failed'); return res.json(); }
    async function refreshMgrStaff(){ const tbody = document.querySelector('#mgrStaffTable tbody'); if(!tbody) return; tbody.innerHTML = '<tr><td colspan="6">加载中...</td></tr>'; try{ const list = await fetchStaff(); const search = document.getElementById('mgrSearch')?.value?.trim().toLowerCase() || ''; const filtered = list.filter(s => !search || (s.archiveId||'').toLowerCase().includes(search) || (s.staffName||'').toLowerCase().includes(search)); tbody.innerHTML = ''; filtered.forEach(s=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${s.archiveId||''}</td><td>${s.staffName||''}</td><td>${s.mobile||''}</td><td>${s.positionId||''}</td><td>${s.status||''}</td><td><button class="mgr-approve" data-id="${s.archiveId}">通过</button> <button class="mgr-reject secondary" data-id="${s.archiveId}">驳回</button></td>`; tbody.appendChild(tr); tr.querySelector('.mgr-approve')?.addEventListener('click', async ()=> { await updateStaffStatus(s.archiveId,'NORMAL'); refreshMgrStaff(); }); tr.querySelector('.mgr-reject')?.addEventListener('click', async ()=> { await updateStaffStatus(s.archiveId,'REJECTED'); refreshMgrStaff(); }); }); }catch(e){ tbody.innerHTML = '<tr><td colspan="6">请求失败</td></tr>'; } }
    document.getElementById('btnRefreshStaffMgr')?.addEventListener('click', refreshMgrStaff);
    async function updateStaffStatus(archiveId, status){ try{ const getRes = await fetch('/api/staff/' + encodeURIComponent(archiveId), { headers: authHeader() }); if(!getRes.ok) throw new Error('无法获取档案'); const existing = await getRes.json(); existing.status = status; const putRes = await fetch('/api/staff/' + encodeURIComponent(archiveId), { method:'PUT', headers: authHeader(), body: JSON.stringify(existing) }); if(!putRes.ok) throw new Error('更新失败'); }catch(e){ alert('更新失败: '+e.message); } }

    // ---------- EMPLOYEE: positions & resumes (reused) ----------
    async function loadPositionsInto(tableSelector, filterInputId, includeApplyButtons){
        const tbody = document.querySelector(tableSelector + ' tbody'); if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';
        try{ const res = await fetch('/api/positions', { headers: authHeader() }); if(!res.ok){ tbody.innerHTML = `<tr><td colspan="5">加载失败: ${res.status}</td></tr>`; return; } const list = await res.json(); const filter = document.getElementById(filterInputId)?.value?.trim().toLowerCase() || ''; const filtered = list.filter(p => !filter || (p.id + ' ' + p.name).toLowerCase().includes(filter)); if(!filtered.length){ tbody.innerHTML = '<tr><td colspan="5">无职位</td></tr>'; return; } tbody.innerHTML = ''; filtered.forEach(p => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${p.id}</td><td>${p.name}</td><td>${p.salary||''}</td><td>${p.overview||''}</td><td>${includeApplyButtons ? '<button class="btn-apply" data-id="'+p.id+'">申请</button>' : ''}</td>`; tbody.appendChild(tr); }); if(includeApplyButtons){ document.querySelectorAll(tableSelector + ' .btn-apply').forEach(b=>{ b.addEventListener('click', async ()=>{ const pid = b.dataset.id; const cover = prompt('填写附言 (可留空)：'); try{ const res = await fetch('/api/resumes', { method: 'POST', headers: authHeader(), body: JSON.stringify({ appliedPositionIds: pid, coverLetter: cover }) }); if(res.ok){ alert('简历提交成功'); loadMyResumes(); } else { const t=await res.text(); alert('提交失败: '+res.status+' '+t); } }catch(e){ alert('请求失败: '+e.message); } }); }); } }catch(e){ tbody.innerHTML = '<tr><td colspan="5">请求失败</td></tr>'; } }
    document.getElementById('btnRefreshPosForEmp')?.addEventListener('click', ()=> loadPositionsInto('#empPositionsTable','empPosSearch', true));

    async function loadMyResumes(){ const tbody = document.querySelector('#myResumesTable tbody'); if(!tbody) return; tbody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>'; try{ const res = await fetch('/api/resumes/mine', { headers: authHeader() }); if(!res.ok){ tbody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>'; return; } const list = await res.json(); tbody.innerHTML = ''; if(!list.length){ tbody.innerHTML = '<tr><td colspan="4">尚无简历</td></tr>'; updateHireStatus(); return; } list.forEach(r=>{ const created = r.createTime ? new Date(r.createTime).toLocaleString() : ''; const tr = document.createElement('tr'); tr.innerHTML = `<td>${r.id}</td><td>${r.appliedPositionIds||''}</td><td>${created}</td><td>${r.status}</td>`; tbody.appendChild(tr); }); updateHireStatus(); }catch(e){ tbody.innerHTML = '<tr><td colspan="4">请求失败</td></tr>'; } }
    document.getElementById('btnRefreshMyResumes')?.addEventListener('click', loadMyResumes);

    // employee profile init
    async function initEmployeeForm(){ try{ const res = await fetch('/api/resumes/mine', { headers: authHeader() }); if(!res.ok) return; const list = await res.json(); const last = list.length ? list[list.length-1] : null; if(last){ document.getElementById('resume_fullName').value = last.fullName || ''; document.getElementById('resume_mobile').value = last.mobile || ''; document.getElementById('resume_appliedPositions').value = last.appliedPositionIds || ''; document.getElementById('btnSaveResume').dataset.resumeId = last.id; document.getElementById('btnSubmitResume').dataset.resumeId = last.id; } else { document.getElementById('btnSaveResume').dataset.resumeId = ''; document.getElementById('btnSubmitResume').dataset.resumeId = ''; } }catch(e){ console.warn(e); } }
    document.getElementById('btnSaveResume')?.addEventListener('click', ()=> saveOrUpdateResume(false));
    document.getElementById('btnSubmitResume')?.addEventListener('click', ()=> { if(confirm('确认提交？')) saveOrUpdateResume(true); });

    async function saveOrUpdateResume(isSubmit){ const id = document.getElementById('btnSaveResume').dataset.resumeId; const payload = { fullName: document.getElementById('resume_fullName').value.trim(), mobile: document.getElementById('resume_mobile').value.trim(), appliedPositionIds: document.getElementById('resume_appliedPositions').value.trim(), status: isSubmit ? 'PENDING' : 'DRAFT' }; try{ let res; if(id){ res = await fetch('/api/resumes/' + encodeURIComponent(id), { method:'PUT', headers: authHeader(), body: JSON.stringify(payload) }); } else { res = await fetch('/api/resumes', { method:'POST', headers: authHeader(), body: JSON.stringify(payload) }); } if(res.ok){ document.getElementById('resumeSaveStatus').textContent = isSubmit ? '已提交' : '已保存'; initEmployeeForm(); loadMyResumes(); } else { document.getElementById('resumeSaveStatus').textContent = '失败: '+ await res.text(); } }catch(e){ document.getElementById('resumeSaveStatus').textContent = '请求失败'; } }

    async function updateHireStatus(){ try{ const meRes = await fetch('/api/auth/me', { headers: authHeader() }); if(!meRes.ok) return; const me = await meRes.json(); const username = me.username; const staffRes = await fetch('/api/staff', { headers: authHeader() }); if(!staffRes.ok){ document.getElementById('hireStatus').textContent = ''; return; } const staff = await staffRes.json(); const found = staff.find(s => s.staffName === username || s.archiveId === username); document.getElementById('hireStatus').textContent = found ? ('已入职，档案ID: ' + found.archiveId) : '尚未入职'; }catch(e){ console.warn(e); } }

    // ---------- Attendance & Leave ----------
    async function populateAttendancePositions(){
        const sel = document.getElementById('att_position');
        if(!sel) return;
        sel.innerHTML = '<option>加载中...</option>';
        try{
            const res = await fetch('/api/positions', { headers: authHeader() });
            if(!res.ok){ sel.innerHTML = '<option>加载失败</option>'; return; }
            const list = await res.json();
            sel.innerHTML = '';
            list.forEach(p => { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.id} - ${p.name}`; sel.appendChild(opt); });
        }catch(e){ sel.innerHTML = '<option>请求失败</option>'; }
    }

    document.getElementById('btnRecordAttendance')?.addEventListener('click', async ()=>{
        const pos = document.getElementById('att_position')?.value;
        const type = document.getElementById('att_type')?.value || 'WORK';
        const statusEl = document.getElementById('attendanceStatus');
        statusEl.textContent = '';
        try{
            const res = await fetch('/api/attendance', { method:'POST', headers: authHeader(), body: JSON.stringify({ positionId: pos, type }) });
            if(res.ok){ statusEl.style.color='green'; statusEl.textContent='考勤记录已保存'; loadMyAttendance(); } else { statusEl.style.color='darkred'; statusEl.textContent='失败: '+await res.text(); }
        }catch(e){ statusEl.style.color='darkred'; statusEl.textContent='请求失败'; }
    });

    async function loadMyAttendance(){
        const tbody = document.querySelector('#myAttendanceTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';
        try{
            const res = await fetch('/api/attendance/mine', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="5">加载失败</td></tr>'; return; }
            const list = await res.json();
            tbody.innerHTML = '';
            list.forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${a.date || ''}</td><td>${a.positionId || ''}</td><td>${a.type || ''}</td><td>${a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</td><td>${a.note||''}</td>`;
                tbody.appendChild(tr);
            });
        }catch(e){ tbody.innerHTML = '<tr><td colspan="5">请求失败</td></tr>'; }
    }
    document.getElementById('btnRefreshMyAttendance')?.addEventListener('click', loadMyAttendance);

    // leave requests - employee
    document.getElementById('btnSubmitLeave')?.addEventListener('click', async ()=>{
        const start = document.getElementById('leave_start')?.value;
        const end = document.getElementById('leave_end')?.value;
        const type = document.getElementById('leave_type')?.value;
        const reason = document.getElementById('leave_reason')?.value;
        const statusEl = document.getElementById('leaveStatus');
        statusEl.textContent = '';
        if(!start||!end){ statusEl.textContent='请选择开始/结束日期'; return; }
        try{
            const res = await fetch('/api/leaves', { method:'POST', headers: authHeader(), body: JSON.stringify({ startDate: start, endDate: end, type, reason }) });
            if(res.ok){ statusEl.style.color='green'; statusEl.textContent='已提交请假申请'; loadMyLeaves(); } else { statusEl.style.color='darkred'; statusEl.textContent='提交失败: '+await res.text(); }
        }catch(e){ statusEl.style.color='darkred'; statusEl.textContent='请求失败'; }
    });

    async function loadMyLeaves(){
        const tbody = document.querySelector('#myLeavesTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';
        try{
            const res = await fetch('/api/leaves/mine', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="5">加载失败</td></tr>'; return; }
            const list = await res.json();
            tbody.innerHTML = '';
            list.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${l.id}</td><td>${l.startDate||''}</td><td>${l.endDate||''}</td><td>${l.type||''}</td><td>${l.status||''}</td>`;
                tbody.appendChild(tr);
            });
        }catch(e){ tbody.innerHTML = '<tr><td colspan="5">请求失败</td></tr>'; }
    }
    document.getElementById('btnRefreshMyLeaves')?.addEventListener('click', loadMyLeaves);

    // HR_SPEC: leave approvals
    async function loadLeaveRequests(){
        const tbody = document.querySelector('#leaveRequestsTable tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7">加载中...</td></tr>';
        try{
            const res = await fetch('/api/leaves', { headers: authHeader() });
            if(!res.ok){ tbody.innerHTML = '<tr><td colspan="7">加载失败</td></tr>'; return; }
            const list = await res.json();
            const filter = document.getElementById('leaveFilter')?.value || 'ALL';
            const filtered = list.filter(l => filter === 'ALL' ? true : l.status === filter);
            tbody.innerHTML = '';
            filtered.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${l.id}</td><td>${l.username}</td><td>${l.startDate||''}</td><td>${l.endDate||''}</td><td>${l.type||''}</td><td>${l.status||''}</td>
                        <td>${l.status==='PENDING' ? `<button class="leave-approve" data-id="${l.id}">通过</button> <button class="leave-reject" data-id="${l.id}">驳回</button>` : ''}</td>`;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.leave-approve').forEach(b => b.addEventListener('click', async ()=>{
                const id = b.dataset.id; if(!confirm('确认批准该请假？')) return;
                const res = await fetch('/api/leaves/' + id + '/approve', { method:'PUT', headers: authHeader() });
                if(res.ok) loadLeaveRequests(); else alert('批准失败: ' + await res.text());
            }));
            document.querySelectorAll('.leave-reject').forEach(b => b.addEventListener('click', async ()=>{
                const id = b.dataset.id; if(!confirm('确认驳回该请假？')) return;
                const res = await fetch('/api/leaves/' + id + '/reject', { method:'PUT', headers: authHeader() });
                if(res.ok) loadLeaveRequests(); else alert('驳回失败: ' + await res.text());
            }));
        }catch(e){ tbody.innerHTML = '<tr><td colspan="7">请求失败</td></tr>'; }
    }
    document.getElementById('btnRefreshLeaves')?.addEventListener('click', loadLeaveRequests);

    // initialization: build menu & show first pane
    await showRoleAndMenu();

})();
// 页面加载时初始化
window.onload = function() {
    const role = localStorage.getItem('hrms_role');
    // 根据角色显示对应菜单和初始化页面
    if (role === 'ADMIN') {
        document.getElementById('menu-org').style.display = 'block';
        document.getElementById('menu-position').style.display = 'block';
        initOrgPage();
        loadOrg3ForPosition();
    } else if (role === 'HR_MANAGER') {
        document.getElementById('menu-org3-edit').style.display = 'block';
        loadAllOrg3();
    } else if (role === 'HR_SPEC') {
        document.getElementById('menu-staff-approve').style.display = 'block';
        loadStaffOrg1();
    }
};

// 显示对应页面
function showPane(paneId) {
    document.querySelectorAll('.pane').forEach(pane => pane.classList.add('hidden'));
    document.getElementById(paneId).classList.remove('hidden');
}