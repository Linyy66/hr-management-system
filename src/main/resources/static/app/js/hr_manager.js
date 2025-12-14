/**
 * 人事经理页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeHrManagerPage();
});

// 初始化人事经理页面
function initializeHrManagerPage() {
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
    
    // 筛选按钮
    const filterBtn = document.querySelector('.approval-filters .btn-primary');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            alert('筛选功能占位符');
        });
    }
    
    // 搜索按钮
    const searchBtn = document.querySelector('#staff .search-bar .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            alert('搜索功能占位符');
        });
    }
    
    // 报表生成按钮
    const reportBtn = document.querySelector('.report-filters .btn-primary');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            alert('生成报表功能占位符');
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
            case 'approvals':
                loadApprovalsData();
                break;
            case 'staff':
                loadStaffData();
                break;
            case 'reports':
                loadReportsData();
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
        currentUserSpan.textContent = '人事经理'; // 占位符
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
        document.getElementById('pending-approvals').textContent = '12';
        document.getElementById('total-staff').textContent = '128';
        document.getElementById('resignations').textContent = '3';
        document.getElementById('absenteeism-rate').textContent = '2.3%';
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载审批数据
async function loadApprovalsData() {
    try {
        // 在实际应用中，这里应该从后端获取审批数据
        const tbody = document.getElementById('approvals-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>张三</td>
                    <td>请假申请</td>
                    <td>2023-06-01</td>
                    <td>待审批</td>
                    <td>
                        <button class="btn-primary btn-small">审批</button>
                    </td>
                </tr>
                <tr>
                    <td>李四</td>
                    <td>加班申请</td>
                    <td>2023-06-02</td>
                    <td>待审批</td>
                    <td>
                        <button class="btn-primary btn-small">审批</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load approvals data error:', error);
    }
}

// 加载员工数据
async function loadStaffData() {
    try {
        // 在实际应用中，这里应该从后端获取员工数据
        const tbody = document.getElementById('staff-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td>E001</td>
                    <td>张三</td>
                    <td>技术部</td>
                    <td>高级软件工程师</td>
                    <td>在职</td>
                    <td>
                        <button class="btn-secondary btn-small">查看</button>
                    </td>
                </tr>
                <tr>
                    <td>E002</td>
                    <td>李四</td>
                    <td>市场部</td>
                    <td>产品经理</td>
                    <td>在职</td>
                    <td>
                        <button class="btn-secondary btn-small">查看</button>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Load staff data error:', error);
    }
}

// 加载报表数据
async function loadReportsData() {
    try {
        // 在实际应用中，这里应该从后端获取报表数据
        // 当前只是静态展示
    } catch (error) {
        console.error('Load reports data error:', error);
    }
}