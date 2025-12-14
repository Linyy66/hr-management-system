/**
 * 人事专员页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeHrSpecPage();
});

// 初始化人事专员页面
function initializeHrSpecPage() {
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
    
    // 新增员工档案按钮
    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', function() {
            alert('新增员工档案功能占位符');
        });
    }
    
    // 搜索按钮
    const searchBtn = document.querySelector('#staff-archive .search-bar .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            alert('搜索功能占位符');
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
            case 'staff-archive':
                loadStaffArchiveData();
                break;
            case 'attendance':
                loadAttendanceExceptionData();
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
        currentUserSpan.textContent = '人事专员'; // 占位符
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
        document.getElementById('pending-archives').textContent = '8';
        document.getElementById('attendance-exceptions').textContent = '5';
        document.getElementById('new-hires').textContent = '2';
        document.getElementById('resignations').textContent = '1';
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载员工档案数据
async function loadStaffArchiveData() {
    try {
        // 在实际应用中，这里应该从后端获取员工档案数据
        const tbody = document.getElementById('archive-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>E001</td>
                    <td>张三</td>
                    <td>技术部</td>
                    <td>高级软件工程师</td>
                    <td>待审批</td>
                    <td>
                        <button class="btn-secondary btn-small">查看</button>
                    </td>
                </tr>
                <tr>
                    <td>E002</td>
                    <td>李四</td>
                    <td>市场部</td>
                    <td>产品经理</td>
                    <td>正常</td>
                    <td>
                        <button class="btn-secondary btn-small">查看</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load staff archive data error:', error);
    }
}

// 加载考勤异常数据
async function loadAttendanceExceptionData() {
    try {
        // 在实际应用中，这里应该从后端获取考勤异常数据
        const tbody = document.getElementById('exception-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>王五</td>
                    <td>2023-06-01</td>
                    <td>迟到</td>
                    <td>2023-06-01 09:15</td>
                    <td>待处理</td>
                    <td>
                        <button class="btn-primary btn-small">处理</button>
                    </td>
                </tr>
                <tr>
                    <td>赵六</td>
                    <td>2023-06-02</td>
                    <td>早退</td>
                    <td>2023-06-02 17:30</td>
                    <td>待处理</td>
                    <td>
                        <button class="btn-primary btn-small">处理</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load attendance exception data error:', error);
    }
}