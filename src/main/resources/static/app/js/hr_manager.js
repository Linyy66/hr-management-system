/**
 * 人事经理页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';
let orgData = {
    level1: [],
    level2: [],
    level3: []
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeHRManagerPage();
});

// 初始化人事经理页面
function initializeHRManagerPage() {
    // 绑定导航链接事件
    bindNavLinks();
    
    // 绑定按钮事件
    bindButtonEvents();
    
    // 加载初始数据
    loadDashboardData();
    
    // 显示当前用户信息
    showCurrentUser();
    
    // 加载组织数据
    loadOrgData();
}

// 绑定导航链接事件
function bindNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pane = this.getAttribute('data-pane');
            if (pane) {
                showPane(pane);
            }
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
        document.getElementById('pending-count').textContent = '12';
        document.getElementById('leave-count').textContent = '8';
        document.getElementById('overtime-count').textContent = '5';
        document.getElementById('staff-count').textContent = '126';
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载组织架构数据
async function loadOrgData() {
    try {
        // 加载一级机构
        const org1Response = await fetch('/api/admin/org/level1');
        const org1Data = await org1Response.json();
        orgData.level1 = org1Data.data || [];
        
        // 加载二级机构
        const org2Response = await fetch('/api/admin/org/level2');
        const org2Data = await org2Response.json();
        orgData.level2 = org2Data.data || [];
        
        // 加载三级机构
        const org3Response = await fetch('/api/admin/org/level3');
        const org3Data = await org3Response.json();
        orgData.level3 = org3Data.data || [];
    } catch (error) {
        console.error('Load organization data error:', error);
    }
}

// 显示指定面板
function showPane(paneId) {
    // 隐藏所有面板
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 显示目标面板
    const targetPanel = document.getElementById(paneId);
    if (targetPanel) {
        targetPanel.classList.add('active');
        currentPane = paneId;
        
        // 更新导航链接的活动状态
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-pane') === paneId) {
                link.classList.add('active');
            }
        });
        
        // 更新面包屑导航
        const currentPageTitle = document.getElementById('current-page-title');
        if (currentPageTitle) {
            switch (paneId) {
                case 'dashboard':
                    currentPageTitle.textContent = '仪表板';
                    break;
                case 'staff':
                    currentPageTitle.textContent = '员工档案管理';
                    break;
                case 'approvals':
                    currentPageTitle.textContent = '审批管理';
                    break;
                case 'reports':
                    currentPageTitle.textContent = '人事报表';
                    break;
                default:
                    currentPageTitle.textContent = '人事经理';
            }
        }
    }
}