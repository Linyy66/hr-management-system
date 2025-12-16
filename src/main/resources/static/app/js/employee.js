/**
 * 员工页面交互逻辑
 */

// 当前活动面板
let currentPane = 'dashboard';
let attendanceRecords = []; // 考勤记录缓存
let leaveApplications = []; // 请假申请记录
let overtimeApplications = []; // 加班申请记录
let transferApplications = []; // 调岗申请记录
let operationLogs = []; // 操作日志
let userProfile = null; // 用户档案信息

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
    
    // 加载个人档案数据
    loadProfileData();
    
    // 默认加载一次所有数据
    loadAttendanceData();
    loadLeaveData();
    loadOvertimeData();
    loadTransferData();
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
    
    // 更新个人信息按钮
    const updateProfileBtn = document.getElementById('update-profile-btn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', updateProfile);
    }
    
    // 考勤打卡按钮
    const clockInBtn = document.getElementById('clock-in-btn');
    if (clockInBtn) {
        clockInBtn.addEventListener('click', clockIn);
    }
    
    const clockOutBtn = document.getElementById('clock-out-btn');
    if (clockOutBtn) {
        clockOutBtn.addEventListener('click', clockOut);
    }
    
    // 请假申请表单提交
    const leaveForm = document.getElementById('leave-application-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', submitLeaveApplication);
    }
    
    // 加班申请表单提交
    const overtimeForm = document.getElementById('overtime-application-form');
    if (overtimeForm) {
        overtimeForm.addEventListener('submit', submitOvertimeApplication);
    }
    
    // 调岗申请按钮
    const transferBtn = document.getElementById('transfer-department-btn');
    if (transferBtn) {
        transferBtn.addEventListener('click', showTransferModal);
    }
    
    // 调岗申请表单提交
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', submitTransferApplication);
    }
    
    // 机构级联选择
    const org1Select = document.getElementById('transfer-org1');
    const org2Select = document.getElementById('transfer-org2');
    const org3Select = document.getElementById('transfer-org3');
    const positionSelect = document.getElementById('transfer-position');
    
    if (org1Select) {
        org1Select.addEventListener('change', function() {
            loadOrg2Options(this.value);
        });
    }
    
    if (org2Select) {
        org2Select.addEventListener('change', function() {
            loadOrg3Options(this.value);
        });
    }
    
    if (org3Select) {
        org3Select.addEventListener('change', function() {
            loadPositionOptions(this.value);
        });
    }
    
    // 页面加载时加载一级机构选项
    loadOrg1Options();
}

// 显示当前用户信息
function showCurrentUser() {
    // 在实际应用中，这里应该从后端获取当前用户信息
    const currentUserSpan = document.getElementById('current-user');
    if (currentUserSpan) {
        currentUserSpan.textContent = '普通员工'; // 占位符
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

// 上班打卡
async function clockIn() {
    try {
        const response = await fetch('/api/employee/attendance/clock-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(`上班打卡成功！时间：${new Date(result.data.clockInTime).toLocaleString()}`);
            // 重新加载考勤记录
            loadAttendanceData();
            // 添加操作日志
            addOperationLog('考勤打卡', `上班打卡时间: ${new Date(result.data.clockInTime).toLocaleString()}`, '成功');
        } else {
            alert(`打卡失败: ${result.message || '未知错误'}`);
            // 添加操作日志
            addOperationLog('考勤打卡', `上班打卡失败: ${result.message || '未知错误'}`, '失败');
        }
    } catch (error) {
        console.error('Clock in error:', error);
        alert('打卡失败，请稍后重试');
        // 添加操作日志
        addOperationLog('考勤打卡', '上班打卡失败: 系统错误', '失败');
    }
}

// 下班打卡
async function clockOut() {
    try {
        const response = await fetch('/api/employee/attendance/clock-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(`下班打卡成功！时间：${new Date(result.data.clockOutTime).toLocaleString()}`);
            // 重新加载考勤记录
            loadAttendanceData();
            // 添加操作日志
            addOperationLog('考勤打卡', `下班打卡时间: ${new Date(result.data.clockOutTime).toLocaleString()}`, '成功');
        } else {
            alert(`签退失败: ${result.message || '未知错误'}`);
            // 添加操作日志
            addOperationLog('考勤打卡', `下班打卡失败: ${result.message || '未知错误'}`, '失败');
        }
    } catch (error) {
        console.error('Clock out error:', error);
        alert('签退失败，请稍后重试');
        // 添加操作日志
        addOperationLog('考勤打卡', '下班打卡失败: 系统错误', '失败');
    }
}

// 渲染考勤记录
function renderAttendanceRecords() {
    const tbody = document.getElementById('attendance-records-body');
    if (!tbody) return;
    
    // 检查是否有记录
    if (!attendanceRecords || attendanceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">暂无考勤记录</td></tr>';
        return;
    }
    
    // 按日期倒序排列
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
        new Date(b.clockInTime) - new Date(a.clockInTime)
    );
    
    tbody.innerHTML = '';
    sortedRecords.forEach(record => {
        // 确保record不为null
        if (!record) return;
        
        const date = record.clockInTime ? new Date(record.clockInTime).toISOString().split('T')[0] : '-';
        const clockInTime = record.clockInTime ? new Date(record.clockInTime).toTimeString().substring(0, 5) : '-';
        const clockOutTime = record.clockOutTime ? new Date(record.clockOutTime).toTimeString().substring(0, 5) : '-';
        
        // 简单的状态判断逻辑
        let status = '缺卡';
        if (record.clockInTime && record.clockOutTime) {
            const [hours, minutes] = clockInTime.split(':');
            if (parseInt(hours) < 9 || (parseInt(hours) === 9 && parseInt(minutes) === 0)) {
                status = '正常';
            } else {
                status = '迟到';
            }
        } else if (record.clockInTime || record.clockOutTime) {
            status = '缺卡';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date}</td>
            <td>${clockInTime}</td>
            <td>${clockOutTime}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 提交请假申请
async function submitLeaveApplication(e) {
    e.preventDefault();
    
    // 获取表单数据
    const leaveType = document.getElementById('leave-type').value;
    const leaveDays = document.getElementById('leave-days').value;
    const startDate = document.getElementById('leave-start-date').value;
    const endDate = document.getElementById('leave-end-date').value;
    const reason = document.getElementById('leave-reason').value;
    
    // 基本验证
    if (!leaveType || !leaveDays || !startDate || !endDate || !reason) {
        alert('请填写所有必填字段');
        return;
    }
    
    try {
        const requestData = {
            leaveType,
            leaveDays: parseFloat(leaveDays),
            startDate: startDate + 'T00:00:00',
            endDate: endDate + 'T00:00:00',
            reason
        };
        
        const response = await fetch('/api/employee/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('请假申请已提交');
            // 重置表单
            document.getElementById('leave-application-form').reset();
            // 重新加载请假数据
            loadLeaveData();
            // 添加操作日志
            addOperationLog('请假申请', `提交了${getLeaveTypeDescription(leaveType)}申请，天数:${leaveDays}`, '待审批');
        } else {
            alert(`提交失败: ${result.message || '未知错误'}`);
            // 添加操作日志
            addOperationLog('请假申请', `提交${getLeaveTypeDescription(leaveType)}申请失败: ${result.message || '未知错误'}`, '失败');
        }
    } catch (error) {
        console.error('Submit leave application error:', error);
        alert('提交失败，请稍后重试');
        // 添加操作日志
        addOperationLog('请假申请', '提交请假申请失败: 系统错误', '失败');
    }
}

// 渲染请假申请记录
function renderLeaveApplications() {
    const tbody = document.getElementById('leave-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    leaveApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}</td>
            <td>${getLeaveTypeDescription(app.leaveType)}</td>
            <td>${app.leaveDays}</td>
            <td>${getApprovalStatusDescription(app.approvalStatus)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewLeaveApplication(${app.id})">查看详情</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 获取请假类型名称
function getLeaveTypeName(type) {
    const types = {
        'annual': '年假',
        'sick': '病假',
        'personal': '事假',
        'marriage': '婚假',
        'maternity': '产假'
    };
    return types[type] || type;
}

// 查看请假申请详情
function viewLeaveApplication(id) {
    const app = leaveApplications.find(a => a.id === id);
    if (app) {
        alert(`请假详情：
申请日期: ${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}
请假类型: ${getLeaveTypeDescription(app.leaveType)}
请假天数: ${app.leaveDays}
开始日期: ${app.startDate ? new Date(app.startDate).toISOString().split('T')[0] : '-'}
结束日期: ${app.endDate ? new Date(app.endDate).toISOString().split('T')[0] : '-'}
请假原因: ${app.reason}
状态: ${getApprovalStatusDescription(app.approvalStatus)}`);
    }
}

// 提交加班申请
async function submitOvertimeApplication(e) {
    e.preventDefault();
    
    // 获取表单数据
    const overtimeDate = document.getElementById('overtime-date').value;
    const overtimeHours = document.getElementById('overtime-hours').value;
    const reason = document.getElementById('overtime-reason').value;
    
    // 基本验证
    if (!overtimeDate || !overtimeHours || !reason) {
        alert('请填写所有必填字段');
        return;
    }
    
    try {
        const requestData = {
            workDate: overtimeDate,
            overtimeHours: parseFloat(overtimeHours),
            reason
        };
        
        const response = await fetch('/api/employee/overtime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('加班申请已提交');
            // 重置表单
            document.getElementById('overtime-application-form').reset();
            // 重新加载加班数据
            loadOvertimeData();
            // 添加操作日志
            addOperationLog('加班申请', `提交了加班申请，日期:${overtimeDate}，小时数:${overtimeHours}`, '待审批');
        } else {
            alert(`提交失败: ${result.message || '未知错误'}`);
            // 添加操作日志
            addOperationLog('加班申请', `提交加班申请失败: ${result.message || '未知错误'}`, '失败');
        }
    } catch (error) {
        console.error('Submit overtime application error:', error);
        alert('提交失败，请稍后重试');
        // 添加操作日志
        addOperationLog('加班申请', '提交加班申请失败: 系统错误', '失败');
    }
}

// 渲染加班申请记录
function renderOvertimeApplications() {
    const tbody = document.getElementById('overtime-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    overtimeApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}</td>
            <td>${app.workDate}</td>
            <td>${app.overtimeHours}</td>
            <td>${getApprovalStatusDescription(app.approvalStatus)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewOvertimeApplication(${app.id})">查看详情</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 查看加班申请详情
function viewOvertimeApplication(id) {
    const app = overtimeApplications.find(a => a.id === id);
    if (app) {
        alert(`加班详情：
申请日期: ${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}
加班日期: ${app.workDate}
加班小时: ${app.overtimeHours}
加班原因: ${app.reason}
状态: ${getApprovalStatusDescription(app.approvalStatus)}`);
    }
}

// 显示调岗申请模态框
function showTransferModal() {
    const modal = document.getElementById('transfer-modal');
    if (modal) {
        modal.style.display = 'block';
        // 加载一级机构选项
        loadOrg1Options();
    }
}

// 关闭调岗申请模态框
function closeTransferModal() {
    const modal = document.getElementById('transfer-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 加载一级机构选项
async function loadOrg1Options() {
    try {
        const org1Select = document.getElementById('transfer-org1');
        if (org1Select) {
            // 从后端获取一级机构数据
            const response = await fetch('/api/hr-spec/org/level1');
            const org1Data = await response.json();
            
            org1Select.innerHTML = '<option value="">请选择</option>';
            
            org1Data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org1Id;
                option.textContent = org.org1Name;
                org1Select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Load org1 options error:', error);
    }
}

// 加载二级机构选项
async function loadOrg2Options(org1Id) {
    try {
        const org2Select = document.getElementById('transfer-org2');
        const org3Select = document.getElementById('transfer-org3');
        const positionSelect = document.getElementById('transfer-position');
        
        if (org2Select) {
            // 清空下级选项
            org2Select.innerHTML = '<option value="">请选择</option>';
            if (org3Select) org3Select.innerHTML = '<option value="">请选择</option>';
            if (positionSelect) positionSelect.innerHTML = '<option value="">请选择</option>';
            
            // 根据org1Id从后端获取二级机构数据
            if (org1Id) {
                const response = await fetch(`/api/hr-spec/org/level2/by-org1/${org1Id}`);
                const org2Data = await response.json();
                
                org2Data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.org2Id;
                    option.textContent = org.org2Name;
                    org2Select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Load org2 options error:', error);
    }
}

// 加载三级机构选项
async function loadOrg3Options(org2Id) {
    try {
        const org3Select = document.getElementById('transfer-org3');
        const positionSelect = document.getElementById('transfer-position');
        
        if (org3Select) {
            // 清空下级选项
            org3Select.innerHTML = '<option value="">请选择</option>';
            if (positionSelect) positionSelect.innerHTML = '<option value="">请选择</option>';
            
            // 根据org2Id从后端获取三级机构数据
            if (org2Id) {
                const response = await fetch(`/api/hr-spec/org/level3/by-org2/${org2Id}`);
                const org3Data = await response.json();
                
                org3Data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.org3Id;
                    option.textContent = org.org3Name;
                    org3Select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Load org3 options error:', error);
    }
}

// 加载职位选项
async function loadPositionOptions(org3Id) {
    try {
        const positionSelect = document.getElementById('transfer-position');
        
        if (positionSelect) {
            // 清空下级选项
            positionSelect.innerHTML = '<option value="">请选择</option>';
            
            // 根据org3Id从后端获取职位数据
            if (org3Id) {
                const response = await fetch(`/api/hr-spec/positions/by-org3/${org3Id}`);
                const positions = await response.json();
                
                positions.forEach(position => {
                    const option = document.createElement('option');
                    option.value = position.positionId;
                    option.textContent = position.positionName;
                    positionSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Load position options error:', error);
    }
}

// 提交调岗申请
async function submitTransferApplication(e) {
    e.preventDefault();
    
    // 获取表单数据
    const org1 = document.getElementById('transfer-org1').value;
    const org2 = document.getElementById('transfer-org2').value;
    const org3 = document.getElementById('transfer-org3').value;
    const position = document.getElementById('transfer-position').value;
    const reason = document.getElementById('transfer-reason').value;
    
    // 基本验证
    if (!org1 || !org2 || !org3 || !position || !reason) {
        alert('请填写所有必填字段');
        return;
    }
    
    try {
        // 准备请求数据
        const requestData = {
            newOrg1Id: org1,
            newOrg2Id: org2,
            newOrg3Id: org3,
            newPositionId: position,
            changeReason: reason
        };
        
        // 发送到后端保存
        const response = await fetch('/api/employee/transfer-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // 添加操作日志
            addOperationLog('调岗申请', `申请调至${org1}-${org2}-${org3}部门，职位:${getPositionName(position)}`, '待审批');
            
            // 关闭模态框
            closeTransferModal();
            
            // 重置表单
            document.getElementById('transfer-form').reset();
            
            alert('调岗申请已提交');
            // 重新加载调岗申请数据
            loadTransferData();
        } else {
            alert(`提交失败: ${result.message || '未知错误'}`);
            // 添加操作日志
            addOperationLog('调岗申请', `提交调岗申请失败: ${result.message || '未知错误'}`, '失败');
        }
    } catch (error) {
        console.error('Submit transfer application error:', error);
        alert('提交失败，请稍后重试');
        // 添加操作日志
        addOperationLog('调岗申请', '提交调岗申请失败: 系统错误', '失败');
    }
}

// 渲染调岗申请记录
function renderTransferApplications() {
    const tbody = document.getElementById('transfer-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    transferApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}</td>
            <td>${getOrgFullName(app.oldOrg1Id, app.oldOrg2Id, app.oldOrg3Id)}</td>
            <td>${getOrgFullName(app.newOrg1Id, app.newOrg2Id, app.newOrg3Id)}</td>
            <td>${app.changeReason}</td>
            <td>${getApprovalStatusDescription(app.approvalStatus)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 获取职位名称
function getPositionName(positionId) {
    const positions = {
        'P001': '高级后端工程师',
        'P002': '后端工程师',
        'P003': '高级前端工程师',
        'P004': '前端工程师'
    };
    return positions[positionId] || positionId;
}

// 查看调岗申请详情
function viewTransferApplication(id) {
    const app = transferApplications.find(a => a.id === id);
    if (app) {
        alert(`调岗申请详情：
申请日期: ${app.createTime ? new Date(app.createTime).toISOString().split('T')[0] : '-'}
目标部门: ${app.newOrg1Id}-${app.newOrg2Id}-${app.newOrg3Id}
目标职位: ${getPositionName(app.newPositionId)}
变更原因: ${app.changeReason}
状态: ${app.approvalStatus}`);
    }
}

// 添加操作日志
function addOperationLog(operationType, details, status) {
    const log = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        operationType,
        details,
        status
    };
    
    operationLogs.push(log);
    
    // 如果在仪表板页面，则更新日志显示
    if (currentPane === 'dashboard') {
        renderOperationLogs();
    }
}

// 渲染操作日志
function renderOperationLogs() {
    const tbody = document.getElementById('operation-logs-body');
    if (!tbody) return;
    
    // 按时间倒序排列
    const sortedLogs = [...operationLogs].sort((a, b) => b.id - a.id);
    
    tbody.innerHTML = '';
    sortedLogs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.timestamp}</td>
            <td>${log.operationType}</td>
            <td>${log.details}</td>
            <td>${log.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 更新个人信息
async function updateProfile() {
    try {
        // 获取表单数据
        const staffName = document.getElementById('profile-staff-name').value;
        const gender = document.getElementById('profile-gender').value;
        const age = document.getElementById('profile-age').value;
        const mobile = document.getElementById('profile-mobile').value;
        const phone = document.getElementById('profile-phone').value;
        const email = document.getElementById('profile-email').value;
        const bio = document.getElementById('profile-bio').value;
        
        const requestData = {
            staffName,
            gender,
            age: age ? parseInt(age) : null,
            mobile,
            phone,
            email,
            bio
        };
        
        const response = await fetch('/api/employee/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('个人信息已更新');
            // 更新本地缓存
            userProfile = result.data;
            // 添加操作日志
            addOperationLog('个人信息更新', '更新了个人信息', '成功');
            // 重新加载个人档案数据以确保UI同步
            loadProfileData();
        } else {
            alert(`更新失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Update profile error:', error);
        alert('更新失败，请稍后重试');
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        // 在实际应用中，这里应该从后端获取统计数据
        // 模拟数据
        document.getElementById('attendance-count').textContent = '0';
        document.getElementById('remaining-leave').textContent = '0';
        document.getElementById('pending-requests').textContent = '0';
        
        // 初始化一些操作日志
        operationLogs = [
            {
                id: 1,
                timestamp: '2025/12/14 09:00:00',
                operationType: '考勤打卡',
                details: '上班打卡时间: 09:00:00',
                status: '成功'
            },
            {
                id: 2,
                timestamp: '2025/12/14 18:00:00',
                operationType: '考勤打卡',
                details: '下班打卡时间: 18:00:00',
                status: '成功'
            },
            {
                id: 3,
                timestamp: '2025/12/10 10:30:00',
                operationType: '请假申请',
                details: '提交年假申请，天数:2',
                status: '通过'
            }
        ];
        
        renderOperationLogs();
    } catch (error) {
        console.error('Load dashboard data error:', error);
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
                case 'profile':
                    currentPageTitle.textContent = '个人档案';
                    break;
                case 'attendance':
                    currentPageTitle.textContent = '考勤管理';
                    break;
                case 'leave':
                    currentPageTitle.textContent = '请假申请';
                    break;
                case 'overtime':
                    currentPageTitle.textContent = '加班申请';
                    break;
                default:
                    currentPageTitle.textContent = '员工自助服务';
            }
        }
        
        // 如果是个人档案面板，加载数据
        if (paneId === 'profile') {
            loadProfileData();
        }
        
        // 如果是考勤面板，加载考勤数据
        if (paneId === 'attendance') {
            loadAttendanceData();
        }
        
        // 如果是请假面板，加载请假数据
        if (paneId === 'leave') {
            loadLeaveData();
        }
        
        // 如果是加班面板，加载加班数据
        if (paneId === 'overtime') {
            loadOvertimeData();
        }
        
        // 如果是仪表板面板，加载操作日志
        if (paneId === 'dashboard') {
            renderOperationLogs();
        }
    }
}

// 加载考勤数据
async function loadAttendanceData() {
    try {
        const response = await fetch('/api/employee/attendance');
        const result = await response.json();
        
        if (response.ok && result.success) {
            attendanceRecords = result.data || [];
            renderAttendanceRecords();
        } else {
            console.error('Load attendance data error:', result.message);
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
        
        if (response.ok && result.success) {
            leaveApplications = result.data || [];
            renderLeaveApplications();
        } else {
            console.error('Load leave data error:', result.message);
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
        
        if (response.ok && result.success) {
            overtimeApplications = result.data || [];
            renderOvertimeApplications();
        } else {
            console.error('Load overtime data error:', result.message);
        }
    } catch (error) {
        console.error('Load overtime data error:', error);
    }
}

// 加载调岗申请数据
async function loadTransferData() {
    try {
        const response = await fetch('/api/employee/transfer-requests');
        const result = await response.json();
        
        if (response.ok && result.success) {
            transferApplications = result.data || [];
            renderTransferApplications();
        } else {
            console.error('Load transfer data error:', result.message);
        }
    } catch (error) {
        console.error('Load transfer data error:', error);
    }
}

// 加载个人档案数据
async function loadProfileData() {
    try {
        const response = await fetch('/api/employee/profile');
        const result = await response.json();
        
        if (response.ok && result.success) {
            userProfile = result.data;
            
            // 填充表单数据
            if (userProfile) {
                document.getElementById('staff-name').textContent = userProfile.staffName || '-';
                document.getElementById('archive-id').textContent = userProfile.archiveId || '-';
                document.getElementById('position-name').textContent = userProfile.positionId || '-';
                document.getElementById('department-name').textContent = getOrgFullName(
                    userProfile.org1Id, userProfile.org2Id, userProfile.org3Id) || '-';
                
                document.getElementById('profile-staff-name').value = userProfile.staffName || '';
                document.getElementById('profile-gender').value = userProfile.gender || '';
                document.getElementById('profile-age').value = userProfile.age || '';
                document.getElementById('profile-mobile').value = userProfile.mobile || '';
                document.getElementById('profile-phone').value = userProfile.phone || '';
                document.getElementById('profile-email').value = userProfile.email || '';
                document.getElementById('profile-bio').value = userProfile.bio || '';
            }
        } else {
            console.error('Load profile data error:', result.message);
        }
    } catch (error) {
        console.error('Load profile data error:', error);
    }
}

// 获取组织全名
function getOrgFullName(org1Id, org2Id, org3Id) {
    // 模拟数据映射
    const orgNames = {
        '01': '技术部',
        '0101': '研发部',
        '010101': '后端开发组',
        '010102': '前端开发组',
        '0102': '测试部',
        '010201': '功能测试组',
        '02': '人事部',
        '0201': '招聘组',
        '020101': '校园招聘组'
    };
    
    const org1Name = orgNames[org1Id] || org1Id;
    const org2Name = orgNames[org2Id] || org2Id;
    const org3Name = orgNames[org3Id] || org3Id;
    
    return `${org1Name} > ${org2Name} > ${org3Name}`;
}

// 获取审批状态描述
function getApprovalStatusDescription(status) {
    switch (status) {
        case 'PENDING':
            return '待审批';
        case 'PENDING_FINAL_APPROVAL':
            return '待终审';
        case 'APPROVED':
            return '已批准';
        case 'REJECTED':
            return '已拒绝';
        default:
            return status;
    }
}

// 获取请假类型描述
function getLeaveTypeDescription(type) {
    switch (type) {
        case 'ANNUAL':
            return '年假';
        case 'SICK':
            return '病假';
        case 'PERSONAL':
            return '事假';
        case 'MATERNITY':
            return '产假';
        case 'PATERNITY':
            return '陪产假';
        case 'MARRIAGE':
            return '婚假';
        default:
            return type;
    }
}