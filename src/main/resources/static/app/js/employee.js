/**
 * 员工页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEmployeePage();
});

// 初始化员工页面
function initializeEmployeePage() {
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
    
    // 上班打卡按钮
    const clockInBtn = document.getElementById('clock-in-btn');
    if (clockInBtn) {
        clockInBtn.addEventListener('click', handleClockIn);
    }
    
    // 下班打卡按钮
    const clockOutBtn = document.getElementById('clock-out-btn');
    if (clockOutBtn) {
        clockOutBtn.addEventListener('click', handleClockOut);
    }
    
    // 更新个人信息按钮
    const updateProfileBtn = document.getElementById('update-profile-btn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', handleUpdateProfile);
    }
    
    // 请假申请表单
    const leaveForm = document.getElementById('leave-application-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', handleLeaveSubmit);
    }
    
    // 加班申请表单
    const overtimeForm = document.getElementById('overtime-application-form');
    if (overtimeForm) {
        overtimeForm.addEventListener('submit', handleOvertimeSubmit);
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
            case 'profile':
                loadProfileData();
                break;
            case 'attendance':
                loadAttendanceData();
                break;
            case 'leave':
                loadLeaveData();
                break;
            case 'overtime':
                loadOvertimeData();
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
        currentUserSpan.textContent = '张三'; // 占位符
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

// 处理上班打卡
async function handleClockIn() {
    try {
        const response = await fetch('/api/employee/attendance/clock-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        if (result.code === 200) {
            alert('打卡成功');
            loadAttendanceData(); // 刷新考勤数据
        } else {
            alert(result.message || '打卡失败');
        }
    } catch (error) {
        console.error('Clock in error:', error);
        alert('打卡失败，请稍后重试');
    }
}

// 处理下班打卡
async function handleClockOut() {
    try {
        const response = await fetch('/api/employee/attendance/clock-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        if (result.code === 200) {
            alert('签退成功');
            loadAttendanceData(); // 刷新考勤数据
        } else {
            alert(result.message || '签退失败');
        }
    } catch (error) {
        console.error('Clock out error:', error);
        alert('签退失败，请稍后重试');
    }
}

// 处理更新个人信息
async function handleUpdateProfile() {
    alert('更新个人信息功能占位符');
}

// 处理请假申请提交
async function handleLeaveSubmit(e) {
    e.preventDefault();
    
    const leaveType = document.getElementById('leave-type').value;
    const leaveDays = document.getElementById('leave-days').value;
    const startDate = document.getElementById('leave-start-date').value;
    const endDate = document.getElementById('leave-end-date').value;
    const reason = document.getElementById('leave-reason').value;
    
    if (!leaveType || !leaveDays || !startDate || !endDate || !reason) {
        alert('请填写完整的请假信息');
        return;
    }
    
    try {
        const response = await fetch('/api/employee/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leaveType,
                days: parseFloat(leaveDays),
                startDate,
                endDate,
                reason
            })
        });
        
        const result = await response.json();
        if (result.code === 200) {
            alert('请假申请提交成功');
            loadLeaveData(); // 刷新请假数据
            document.getElementById('leave-application-form').reset();
        } else {
            alert(result.message || '提交失败');
        }
    } catch (error) {
        console.error('Leave application error:', error);
        alert('提交失败，请稍后重试');
    }
}

// 处理加班申请提交
async function handleOvertimeSubmit(e) {
    e.preventDefault();
    
    const overtimeDate = document.getElementById('overtime-date').value;
    const overtimeHours = document.getElementById('overtime-hours').value;
    const reason = document.getElementById('overtime-reason').value;
    
    if (!overtimeDate || !overtimeHours || !reason) {
        alert('请填写完整的加班信息');
        return;
    }
    
    try {
        const response = await fetch('/api/employee/overtime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                overtimeDate,
                hours: parseFloat(overtimeHours),
                reason
            })
        });
        
        const result = await response.json();
        if (result.code === 200) {
            alert('加班申请提交成功');
            loadOvertimeData(); // 刷新加班数据
            document.getElementById('overtime-application-form').reset();
        } else {
            alert(result.message || '提交失败');
        }
    } catch (error) {
        console.error('Overtime application error:', error);
        alert('提交失败，请稍后重试');
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        // 在实际应用中，这里应该从后端获取统计数据
        // 模拟数据
        document.getElementById('attendance-count').textContent = '20';
        document.getElementById('remaining-leave').textContent = '5';
        document.getElementById('pending-requests').textContent = '2';
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载个人档案数据
async function loadProfileData() {
    try {
        const response = await fetch('/api/employee/profile');
        const result = await response.json();
        
        if (result.code === 200) {
            const profile = result.data;
            document.getElementById('staff-name').textContent = profile.staffName || '-';
            document.getElementById('archive-id').textContent = profile.id || '-';
            document.getElementById('position-name').textContent = profile.positionName || '-';
            document.getElementById('department-name').textContent = profile.departmentName || '-';
            
            document.getElementById('profile-staff-name').value = profile.staffName || '';
            document.getElementById('profile-gender').value = profile.gender || '';
            document.getElementById('profile-id-card').value = profile.idCard || '';
            document.getElementById('profile-mobile').value = profile.mobile || '';
            document.getElementById('profile-phone').value = profile.phone || '';
            document.getElementById('profile-email').value = profile.email || '';
        }
    } catch (error) {
        console.error('Load profile data error:', error);
    }
}

// 加载考勤数据
async function loadAttendanceData() {
    try {
        const response = await fetch('/api/employee/attendance');
        const result = await response.json();
        
        if (result.code === 200) {
            const records = result.data;
            const tbody = document.getElementById('attendance-records-body');
            
            if (tbody) {
                if (records && records.length > 0) {
                    tbody.innerHTML = records.map(record => `
                        <tr>
                            <td>${record.clockInTime ? new Date(record.clockInTime).toLocaleDateString() : '-'}</td>
                            <td>${record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString() : '-'}</td>
                            <td>${record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString() : '-'}</td>
                            <td>${getStatusText(record)}</td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">暂无考勤记录</td></tr>';
                }
            }
        }
    } catch (error) {
        console.error('Load attendance data error:', error);
    }
}

// 加载请假数据
async function loadLeaveData() {
    try {
        const response = await fetch('/api/employee/leave');
        const result = await response.json();
        
        if (result.code === 200) {
            const applications = result.data;
            const tbody = document.getElementById('leave-applications-body');
            
            if (tbody) {
                if (applications && applications.length > 0) {
                    tbody.innerHTML = applications.map(app => `
                        <tr>
                            <td>${app.createTime ? new Date(app.createTime).toLocaleDateString() : '-'}</td>
                            <td>${getLeaveTypeText(app.leaveType)}</td>
                            <td>${app.days}</td>
                            <td>${getStatusText(app)}</td>
                            <td>
                                <button class="btn-secondary btn-small">查看</button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5">暂无请假记录</td></tr>';
                }
            }
        }
    } catch (error) {
        console.error('Load leave data error:', error);
    }
}

// 加载加班数据
async function loadOvertimeData() {
    try {
        const response = await fetch('/api/employee/overtime');
        const result = await response.json();
        
        if (result.code === 200) {
            const applications = result.data;
            const tbody = document.getElementById('overtime-applications-body');
            
            if (tbody) {
                if (applications && applications.length > 0) {
                    tbody.innerHTML = applications.map(app => `
                        <tr>
                            <td>${app.createTime ? new Date(app.createTime).toLocaleDateString() : '-'}</td>
                            <td>${app.overtimeDate}</td>
                            <td>${app.hours}</td>
                            <td>${getStatusText(app)}</td>
                            <td>
                                <button class="btn-secondary btn-small">查看</button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5">暂无加班记录</td></tr>';
                }
            }
        }
    } catch (error) {
        console.error('Load overtime data error:', error);
    }
}

// 获取状态文本
function getStatusText(item) {
    const statusMap = {
        'NORMAL': '正常',
        'PENDING': '待审批',
        'APPROVED': '已批准',
        'REJECTED': '已拒绝',
        'PENDING_FINAL_APPROVAL': '待终审'
    };
    
    return statusMap[item.status] || item.status || '-';
}

// 获取请假类型文本
function getLeaveTypeText(type) {
    const typeMap = {
        'annual': '年假',
        'sick': '病假',
        'personal': '事假',
        'marriage': '婚假',
        'maternity': '产假'
    };
    
    return typeMap[type] || type || '-';
}