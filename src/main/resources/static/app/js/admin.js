/**
 * 管理员页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
});

// 初始化管理员页面
function initializeAdminPage() {
    // 绑定导航链接事件
    bindNavLinks();
    
    // 绑定按钮事件
    bindButtonEvents();
    
    // 加载初始数据
    loadDashboardData();
    
    // 显示当前用户信息
    showCurrentUser();
}

// 绑定导航链接事件
function bindNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pane = this.getAttribute('data-pane');
            showPane(pane);
        });
    });
}

// 绑定按钮事件
function bindButtonEvents() {
    // 退出按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 新增用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            alert('新增用户功能占位符');
        });
    }
    
    // 新增机构按钮
    const addOrgBtn = document.getElementById('add-org-btn');
    if (addOrgBtn) {
        addOrgBtn.addEventListener('click', function() {
            alert('新增机构功能占位符');
        });
    }
    
    // 新增职位按钮
    const addPositionBtn = document.getElementById('add-position-btn');
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', function() {
            alert('新增职位功能占位符');
        });
    }
    
    // 新增角色按钮
    const addRoleBtn = document.getElementById('add-role-btn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', function() {
            alert('新增角色功能占位符');
        });
    }
}

// 显示指定面板
function showPane(pane) {
    // 隐藏所有面板
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 显示目标面板
    const targetPane = document.getElementById(pane);
    if (targetPane) {
        targetPane.classList.add('active');
        currentPane = pane;
        
        // 根据面板加载相应数据
        switch (pane) {
            case 'users':
                loadUsersData();
                break;
            case 'org':
                loadOrgData();
                break;
            case 'positions':
                loadPositionsData();
                break;
            case 'roles':
                loadRolesData();
                break;
            case 'attendance-rules':
                loadAttendanceRulesData();
                break;
        }
    }
    
    // 更新导航链接激活状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-pane') === pane) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 显示当前用户信息
function showCurrentUser() {
    // 在实际应用中，这里应该从后端获取当前用户信息
    const currentUserSpan = document.getElementById('current-user');
    if (currentUserSpan) {
        currentUserSpan.textContent = '管理员'; // 占位符
    }
}

// 处理退出登录
async function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        try {
            await fetch('/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login.html';
        }
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        // 在实际应用中，这里应该从后端获取统计数据
        // 模拟数据
        document.getElementById('org1-count').textContent = '3';
        document.getElementById('position-count').textContent = '15';
        document.getElementById('user-count').textContent = '28';
        document.getElementById('role-count').textContent = '4';
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载用户数据
async function loadUsersData() {
    try {
        // 在实际应用中，这里应该从后端获取用户列表
        const tbody = document.getElementById('users-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>admin</td>
                    <td>ADMIN</td>
                    <td>启用</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>spec</td>
                    <td>HR_SPEC</td>
                    <td>启用</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>mrg</td>
                    <td>HR_MANAGER</td>
                    <td>启用</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load users data error:', error);
    }
}

// 加载组织架构数据
async function loadOrgData() {
    try {
        // 在实际应用中，这里应该从后端获取组织架构数据
        const level1List = document.getElementById('org-level1-list');
        const level2List = document.getElementById('org-level2-list');
        const level3List = document.getElementById('org-level3-list');
        
        if (level1List) {
            level1List.innerHTML = '<p>技术部</p><p>市场部</p><p>人事部</p>';
        }
        
        if (level2List) {
            level2List.innerHTML = '<p>前端组</p><p>后端组</p><p>测试组</p>';
        }
        
        if (level3List) {
            level3List.innerHTML = '<p>开发一组</p><p>开发二组</p><p>运维组</p>';
        }
    } catch (error) {
        console.error('Load org data error:', error);
    }
}

// 加载职位数据
async function loadPositionsData() {
    try {
        // 在实际应用中，这里应该从后端获取职位数据
        const tbody = document.getElementById('positions-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>P001</td>
                    <td>高级软件工程师</td>
                    <td>技术部-后端组</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>P002</td>
                    <td>产品经理</td>
                    <td>市场部-产品组</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load positions data error:', error);
    }
}

// 加载角色数据
async function loadRolesData() {
    try {
        // 在实际应用中，这里应该从后端获取角色数据
        const tbody = document.getElementById('roles-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>ADMIN</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>HR_MANAGER</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>HR_SPEC</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
                <tr>
                    <td>EMPLOYEE</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load roles data error:', error);
    }
}

// 加载考勤规则数据
async function loadAttendanceRulesData() {
    try {
        // 在实际应用中，这里应该从后端获取考勤规则数据
        const tbody = document.getElementById('rules-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>标准工作时间</td>
                    <td>全公司</td>
                    <td>9:00-18:00</td>
                    <td>
                        <button class="btn-secondary btn-small">编辑</button>
                        <button class="btn-danger btn-small">删除</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load attendance rules data error:', error);
    }
}