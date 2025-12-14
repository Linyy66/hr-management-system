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
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    
    // 查找今天的记录或创建新记录
    let record = attendanceRecords.find(r => r.date === dateStr);
    if (!record) {
        record = {
            date: dateStr,
            clockIn: null,
            clockOut: null,
            status: '缺卡'
        };
        attendanceRecords.push(record);
    }
    
    // 设置上班时间
    record.clockIn = timeStr;
    updateRecordStatus(record);
    
    // 添加操作日志
    addOperationLog('考勤打卡', `上班打卡时间: ${timeStr}`, '成功');
    
    // 更新UI
    renderAttendanceRecords();
    
    alert(`上班打卡成功！时间：${timeStr}`);
}

// 下班打卡
async function clockOut() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    
    // 查找今天的记录或创建新记录
    let record = attendanceRecords.find(r => r.date === dateStr);
    if (!record) {
        record = {
            date: dateStr,
            clockIn: null,
            clockOut: null,
            status: '缺卡'
        };
        attendanceRecords.push(record);
    }
    
    // 设置下班时间
    record.clockOut = timeStr;
    updateRecordStatus(record);
    
    // 添加操作日志
    addOperationLog('考勤打卡', `下班打卡时间: ${timeStr}`, '成功');
    
    // 更新UI
    renderAttendanceRecords();
    
    alert(`下班打卡成功！时间：${timeStr}`);
}

// 更新考勤状态
function updateRecordStatus(record) {
    // 简单的状态判断逻辑（实际应用中应该从后端获取规则）
    if (record.clockIn && record.clockOut) {
        // 假设9点前为正常，9点后为迟到
        const [hours, minutes] = record.clockIn.split(':');
        if (parseInt(hours) < 9 || (parseInt(hours) === 9 && parseInt(minutes) === 0)) {
            record.status = '正常';
        } else {
            record.status = '迟到';
        }
    } else if (record.clockIn || record.clockOut) {
        record.status = '缺卡';
    } else {
        record.status = '缺卡';
    }
}

// 渲染考勤记录
function renderAttendanceRecords() {
    const tbody = document.getElementById('attendance-records-body');
    if (!tbody) return;
    
    // 按日期倒序排列
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    tbody.innerHTML = '';
    sortedRecords.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${record.clockIn || '-'}</td>
            <td>${record.clockOut || '-'}</td>
            <td>${record.status}</td>
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
    
    // 创建申请记录
    const application = {
        id: Date.now(), // 简单ID生成
        applyDate: new Date().toISOString().split('T')[0],
        leaveType,
        leaveDays,
        startDate,
        endDate,
        reason,
        status: '待定' // 默认状态
    };
    
    // 添加到申请列表
    leaveApplications.push(application);
    
    // 添加操作日志
    addOperationLog('请假申请', `提交${getLeaveTypeName(leaveType)}申请，天数:${leaveDays}`, '待审批');
    
    // 更新UI
    renderLeaveApplications();
    
    // 重置表单
    document.getElementById('leave-application-form').reset();
    
    alert('请假申请已提交');
}

// 渲染请假申请记录
function renderLeaveApplications() {
    const tbody = document.getElementById('leave-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    leaveApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applyDate}</td>
            <td>${getLeaveTypeName(app.leaveType)}</td>
            <td>${app.leaveDays}</td>
            <td>${app.status}</td>
            <td>
                <button class="btn-small btn-secondary" onclick="viewLeaveApplication(${app.id})">查看</button>
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
申请日期: ${app.applyDate}
请假类型: ${getLeaveTypeName(app.leaveType)}
请假天数: ${app.leaveDays}
开始日期: ${app.startDate}
结束日期: ${app.endDate}
请假原因: ${app.reason}
状态: ${app.status}`);
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
    
    // 创建申请记录
    const application = {
        id: Date.now(), // 简单ID生成
        applyDate: new Date().toISOString().split('T')[0],
        overtimeDate,
        overtimeHours,
        reason,
        status: '待定' // 默认状态
    };
    
    // 添加到申请列表
    overtimeApplications.push(application);
    
    // 添加操作日志
    addOperationLog('加班申请', `提交加班申请，小时数:${overtimeHours}`, '待审批');
    
    // 更新UI
    renderOvertimeApplications();
    
    // 重置表单
    document.getElementById('overtime-application-form').reset();
    
    alert('加班申请已提交');
}

// 渲染加班申请记录
function renderOvertimeApplications() {
    const tbody = document.getElementById('overtime-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    overtimeApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applyDate}</td>
            <td>${app.overtimeDate}</td>
            <td>${app.overtimeHours}</td>
            <td>${app.status}</td>
            <td>
                <button class="btn-small btn-secondary" onclick="viewOvertimeApplication(${app.id})">查看</button>
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
申请日期: ${app.applyDate}
加班日期: ${app.overtimeDate}
加班小时: ${app.overtimeHours}
加班原因: ${app.reason}
状态: ${app.status}`);
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
        // 在实际应用中，这里应该从后端获取一级机构数据
        const org1Select = document.getElementById('transfer-org1');
        if (org1Select) {
            // 模拟数据
            org1Select.innerHTML = '<option value="">请选择</option>' +
                '<option value="01">技术部</option>' +
                '<option value="02">人事部</option>' +
                '<option value="03">财务部</option>';
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
            
            // 在实际应用中，这里应该根据org1Id从后端获取二级机构数据
            // 模拟数据
            if (org1Id === '01') {
                org2Select.innerHTML = '<option value="">请选择</option>' +
                    '<option value="0101">开发组</option>' +
                    '<option value="0102">测试组</option>';
            } else if (org1Id === '02') {
                org2Select.innerHTML = '<option value="">请选择</option>' +
                    '<option value="0201">招聘组</option>' +
                    '<option value="0202">培训组</option>';
            } else if (org1Id === '03') {
                org2Select.innerHTML = '<option value="">请选择</option>' +
                    '<option value="0301">会计组</option>' +
                    '<option value="0302">审计组</option>';
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
            
            // 在实际应用中，这里应该根据org2Id从后端获取三级机构数据
            // 模拟数据
            if (org2Id === '0101') {
                org3Select.innerHTML = '<option value="">请选择</option>' +
                    '<option value="010101">后端开发</option>' +
                    '<option value="010102">前端开发</option>';
            } else if (org2Id === '0102') {
                org3Select.innerHTML = '<option value="">请选择</option>' +
                    '<option value="010201">功能测试</option>' +
                    '<option value="010202">性能测试</option>';
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
            
            // 在实际应用中，这里应该根据org3Id从后端获取职位数据
            // 模拟数据
            if (org3Id === '010101') {
                positionSelect.innerHTML = '<option value="">请选择</option>' +
                    '<option value="P001">高级后端工程师</option>' +
                    '<option value="P002">后端工程师</option>';
            } else if (org3Id === '010102') {
                positionSelect.innerHTML = '<option value="">请选择</option>' +
                    '<option value="P003">高级前端工程师</option>' +
                    '<option value="P004">前端工程师</option>';
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
    
    // 创建申请记录
    const application = {
        id: Date.now(), // 简单ID生成
        applyDate: new Date().toISOString().split('T')[0],
        targetOrg1: org1,
        targetOrg2: org2,
        targetOrg3: org3,
        targetPosition: position,
        reason,
        status: '待定' // 默认状态
    };
    
    // 添加到申请列表
    transferApplications.push(application);
    
    // 添加操作日志
    addOperationLog('调岗申请', `申请调至${org1}-${org2}-${org3}部门，职位:${getPositionName(position)}`, '待审批');
    
    // 更新UI
    renderTransferApplications();
    
    // 关闭模态框
    closeTransferModal();
    
    // 重置表单
    document.getElementById('transfer-form').reset();
    
    alert('调岗申请已提交');
}

// 渲染调岗申请记录
function renderTransferApplications() {
    const tbody = document.getElementById('transfer-applications-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    transferApplications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applyDate}</td>
            <td>${app.targetOrg1}-${app.targetOrg2}-${app.targetOrg3}</td>
            <td>${getPositionName(app.targetPosition)}</td>
            <td>${app.status}</td>
            <td>
                <button class="btn-small btn-secondary" onclick="viewTransferApplication(${app.id})">查看</button>
            </td>
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
申请日期: ${app.applyDate}
目标部门: ${app.targetOrg1}-${app.targetOrg2}-${app.targetOrg3}
目标职位: ${getPositionName(app.targetPosition)}
变更原因: ${app.reason}
状态: ${app.status}`);
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
    // 在实际应用中，这里应该发送请求到后端更新数据
    alert('个人信息已更新');
    
    // 获取表单数据
    const staffName = document.getElementById('profile-staff-name').value;
    const gender = document.getElementById('profile-gender').value;
    const age = document.getElementById('profile-age').value;
    const mobile = document.getElementById('profile-mobile').value;
    const phone = document.getElementById('profile-phone').value;
    const email = document.getElementById('profile-email').value;
    const bio = document.getElementById('profile-bio').value;
    
    // 添加操作日志
    addOperationLog('个人信息更新', '更新了个人信息', '成功');
    
    console.log('Updating profile:', { staffName, gender, age, mobile, phone, email, bio });
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
            loadTransferData();
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
        // 在实际应用中，这里应该从后端获取考勤数据
        // 目前使用模拟数据
        const today = new Date().toISOString().split('T')[0];
        attendanceRecords = [
            {
                date: today,
                clockIn: null,
                clockOut: null,
                status: '缺卡'
            }
        ];
        renderAttendanceRecords();
    } catch (error) {
        console.error('Load attendance data error:', error);
    }
}

// 加载请假数据
async function loadLeaveData() {
    try {
        // 在实际应用中，这里应该从后端获取请假数据
        // 目前使用模拟数据
        leaveApplications = [
            {
                id: 1,
                applyDate: '2025-12-01',
                leaveType: 'annual',
                leaveDays: 2,
                startDate: '2025-12-10',
                endDate: '2025-12-11',
                reason: '年假',
                status: '通过'
            },
            {
                id: 2,
                applyDate: '2025-12-05',
                leaveType: 'sick',
                leaveDays: 1,
                startDate: '2025-12-15',
                endDate: '2025-12-15',
                reason: '感冒',
                status: '未通过'
            }
        ];
        renderLeaveApplications();
    } catch (error) {
        console.error('Load leave data error:', error);
    }
}

// 加载加班数据
async function loadOvertimeData() {
    try {
        // 在实际应用中，这里应该从后端获取加班数据
        // 目前使用模拟数据
        overtimeApplications = [
            {
                id: 1,
                applyDate: '2025-12-01',
                overtimeDate: '2025-12-01',
                overtimeHours: 2,
                reason: '项目紧急上线',
                status: '通过'
            },
            {
                id: 2,
                applyDate: '2025-12-03',
                overtimeDate: '2025-12-05',
                overtimeHours: 3,
                reason: '处理客户问题',
                status: '待定'
            }
        ];
        renderOvertimeApplications();
    } catch (error) {
        console.error('Load overtime data error:', error);
    }
}

// 加载调岗申请数据
async function loadTransferData() {
    try {
        // 在实际应用中，这里应该从后端获取调岗申请数据
        // 目前使用模拟数据
        transferApplications = [
            {
                id: 1,
                applyDate: '2025-12-01',
                targetOrg1: '01',
                targetOrg2: '0101',
                targetOrg3: '010101',
                targetPosition: 'P001',
                reason: '个人发展需要',
                status: '通过'
            },
            {
                id: 2,
                applyDate: '2025-12-05',
                targetOrg1: '02',
                targetOrg2: '0201',
                targetOrg3: '020101',
                targetPosition: 'P003',
                reason: '兴趣转换',
                status: '待定'
            }
        ];
        renderTransferApplications();
    } catch (error) {
        console.error('Load transfer data error:', error);
    }
}

// 加载个人档案数据
async function loadProfileData() {
    try {
        // 在实际应用中，这里应该从后端获取员工档案数据
        // 模拟数据（初始为空）
        document.getElementById('staff-name').textContent = '-';
        document.getElementById('archive-id').textContent = 'EMP0001';
        document.getElementById('position-name').textContent = '-';
        document.getElementById('department-name').textContent = '-';
        
        document.getElementById('profile-staff-name').value = '';
        document.getElementById('profile-gender').value = '';
        document.getElementById('profile-age').value = '';
        document.getElementById('profile-mobile').value = '';
        document.getElementById('profile-phone').value = '';
        document.getElementById('profile-email').value = '';
        document.getElementById('profile-bio').value = '';
    } catch (error) {
        console.error('Load profile data error:', error);
    }
}