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
let staffData = []; // 员工数据缓存
let leaveApplications = []; // 请假申请数据
let overtimeApplications = []; // 加班申请数据
let departmentChangeRequests = []; // 调岗申请数据

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
    
    // 员工搜索按钮
    const searchBtn = document.getElementById('staff-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleStaffSearch);
    }
    
    // 员工搜索输入框回车事件
    const searchInput = document.getElementById('staff-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleStaffSearch();
            }
        });
    }
    
    // 审批筛选按钮
    const approvalFilterBtn = document.getElementById('approval-filter-btn');
    if (approvalFilterBtn) {
        approvalFilterBtn.addEventListener('click', filterApprovals);
    }
    
    // 报表生成按钮
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // 报表下载按钮
    const downloadReportBtn = document.getElementById('download-report-btn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', downloadReport);
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
        // 获取待处理的员工档案数量
        const staffResponse = await fetch('/api/hr-manager/staff');
        const staffArchives = await staffResponse.json();
        const pendingArchives = staffArchives.filter(archive => archive.status === 'PENDING').length;
        
        // 获取请假申请数量
        const leaveResponse = await fetch('/api/hr-manager/leave-applications');
        const leaveApps = await leaveResponse.json();
        
        // 获取加班申请数量
        const overtimeResponse = await fetch('/api/hr-manager/overtime-applications');
        const overtimeApps = await overtimeResponse.json();
        
        document.getElementById('pending-count').textContent = pendingArchives;
        document.getElementById('leave-count').textContent = leaveApps.length;
        document.getElementById('overtime-count').textContent = overtimeApps.length;
        document.getElementById('staff-count').textContent = staffArchives.length;
    } catch (error) {
        console.error('Load dashboard data error:', error);
    }
}

// 加载组织架构数据
async function loadOrgData() {
    try {
        // 加载一级机构
        const org1Response = await fetch('/api/hr-manager/org/level1');
        const org1Data = await org1Response.json();
        orgData.level1 = org1Data || [];
        
        // 加载二级机构
        const org2Response = await fetch('/api/hr-manager/org/level2');
        const org2Data = await org2Response.json();
        orgData.level2 = org2Data || [];
        
        // 加载三级机构
        const org3Response = await fetch('/api/hr-manager/org/level3');
        const org3Data = await org3Response.json();
        orgData.level3 = org3Data || [];
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
                    loadStaffData(); // 加载员工数据
                    break;
                case 'approvals':
                    currentPageTitle.textContent = '审批管理';
                    loadApprovalData(); // 加载审批数据
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

// 加载员工数据
async function loadStaffData() {
    try {
        const response = await fetch('/api/hr-manager/staff');
        staffData = await response.json();
        renderStaffTable(staffData);
    } catch (error) {
        console.error('Load staff data error:', error);
    }
}

// 渲染员工表格
function renderStaffTable(staffList) {
    const tbody = document.getElementById('staff-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!staffList || staffList.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" class="text-center">暂无员工数据</td>';
        tbody.appendChild(tr);
        return;
    }
    
    staffList.forEach(staff => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${staff.staffId}</td>
            <td>${staff.staffName}</td>
            <td>${staff.gender}</td>
            <td>${getOrgFullName(staff.org1Id, staff.org2Id, staff.org3Id)}</td>
            <td>${staff.positionId}</td>
            <td>${staff.mobile}</td>
            <td>${getStatusText(staff.status)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewStaffDetails('${staff.staffId}')">查看</button>
                <button class="btn-small btn-secondary" onclick="rollbackStaffChanges('${staff.staffId}')">打回</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 获取组织全名
function getOrgFullName(org1Id, org2Id, org3Id) {
    const org1 = orgData.level1.find(org => org.org1Id === org1Id);
    const org2 = orgData.level2.find(org => org.org2Id === org2Id);
    const org3 = orgData.level3.find(org => org.org3Id === org3Id);
    
    return `${org1 ? org1.org1Name : ''} > ${org2 ? org2.org2Name : ''} > ${org3 ? org3.org3Name : ''}`;
}

// 获取状态文本
function getStatusText(status) {
    switch (status) {
        case 'PENDING':
            return '待审批';
        case 'NORMAL':
            return '正常';
        case 'REJECTED':
            return '已拒绝';
        case 'DELETED':
            return '已删除';
        default:
            return status;
    }
}

// 查看员工详情
async function viewStaffDetails(staffId) {
    try {
        const response = await fetch(`/api/hr-manager/staff/${staffId}`);
        const staff = await response.json();
        
        if (response.ok) {
            alert(`员工详情:

员工编号: ${staff.staffId}
姓名: ${staff.staffName}
性别: ${staff.gender}
年龄: ${staff.age}
手机: ${staff.mobile}
邮箱: ${staff.email}
状态: ${getStatusText(staff.status)}`);
        } else {
            alert('获取员工详情失败');
        }
    } catch (error) {
        console.error('View staff details error:', error);
        alert('获取员工详情失败');
    }
}

// 打回员工变更
async function rollbackStaffChanges(staffId) {
    if (!confirm('确定要打回该员工的变更吗？')) {
        return;
    }
    
    try {
        const reason = prompt('请输入打回原因:');
        if (!reason) {
            alert('请输入打回原因');
            return;
        }
        
        const response = await fetch(`/api/hr-manager/staff/${staffId}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('员工变更已打回');
            // 重新加载员工数据
            loadStaffData();
        } else {
            alert('打回操作失败');
        }
    } catch (error) {
        console.error('Rollback staff changes error:', error);
        alert('打回操作失败');
    }
}

// 处理员工搜索
async function handleStaffSearch() {
    const keyword = document.getElementById('staff-search').value.trim();
    if (!keyword) {
        loadStaffData(); // 如果没有关键字，则加载所有员工数据
        return;
    }
    
    try {
        const response = await fetch('/api/hr-manager/staff');
        const allStaff = await response.json();
        
        // 根据姓名、员工账号、员工编号搜索
        const filteredStaff = allStaff.filter(staff => 
            staff.staffName.includes(keyword) || 
            staff.accountId.includes(keyword) || 
            staff.staffId.includes(keyword)
        );
        
        renderStaffTable(filteredStaff);
    } catch (error) {
        console.error('Search staff error:', error);
        alert('搜索失败');
    }
}

// 加载审批数据
async function loadApprovalData() {
    try {
        // 加载请假申请
        const leaveResponse = await fetch('/api/hr-manager/leave-applications');
        leaveApplications = await leaveResponse.json();
        
        // 加载加班申请
        const overtimeResponse = await fetch('/api/hr-manager/overtime-applications');
        overtimeApplications = await overtimeResponse.json();
        
        // 加载调岗申请
        const deptChangeResponse = await fetch('/api/hr-manager/department-change-requests');
        departmentChangeRequests = await deptChangeResponse.json();
        
        // 渲染审批表格
        renderApprovalTables();
    } catch (error) {
        console.error('Load approval data error:', error);
    }
}

// 渲染审批表格
function renderApprovalTables() {
    renderLeaveApprovalTable(leaveApplications);
    renderOvertimeApprovalTable(overtimeApplications);
    renderDepartmentChangeApprovalTable(departmentChangeRequests);
}

// 渲染请假审批表格
function renderLeaveApprovalTable(applications) {
    const tbody = document.getElementById('leave-approvals-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!applications || applications.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">暂无请假申请</td>';
        tbody.appendChild(tr);
        return;
    }
    
    applications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${getStaffNameByArchiveId(app.archiveId)}</td>
            <td>${getLeaveTypeText(app.leaveType)}</td>
            <td>${app.leaveDays}</td>
            <td>${formatDate(app.createTime)}</td>
            <td>${getStatusText(app.status)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="approveLeaveApplication(${app.id})">通过</button>
                <button class="btn-small btn-danger" onclick="rejectLeaveApplication(${app.id})">驳回</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 渲染加班审批表格
function renderOvertimeApprovalTable(applications) {
    const tbody = document.getElementById('overtime-approvals-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!applications || applications.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">暂无加班申请</td>';
        tbody.appendChild(tr);
        return;
    }
    
    applications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${getStaffNameByArchiveId(app.archiveId)}</td>
            <td>${formatDate(app.overtimeDate)}</td>
            <td>${app.hours}</td>
            <td>${formatDate(app.createTime)}</td>
            <td>${getStatusText(app.status)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="approveOvertimeApplication(${app.id})">通过</button>
                <button class="btn-small btn-danger" onclick="rejectOvertimeApplication(${app.id})">驳回</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 渲染调岗审批表格
function renderDepartmentChangeApprovalTable(requests) {
    const tbody = document.getElementById('transfer-approvals-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!requests || requests.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">暂无调岗申请</td>';
        tbody.appendChild(tr);
        return;
    }
    
    requests.forEach(request => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${getStaffNameByArchiveId(request.archiveId)}</td>
            <td>${getOrgFullName(request.currentOrg1Id, request.currentOrg2Id, request.currentOrg3Id)} > ${request.currentPositionId}</td>
            <td>${getOrgFullName(request.newOrg1Id, request.newOrg2Id, request.newOrg3Id)} > ${request.newPositionId}</td>
            <td>${formatDate(request.createTime)}</td>
            <td>${getStatusText(request.status)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="approveDepartmentChangeRequest(${request.id})">通过</button>
                <button class="btn-small btn-danger" onclick="rejectDepartmentChangeRequest(${request.id})">驳回</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 根据档案ID获取员工姓名
function getStaffNameByArchiveId(archiveId) {
    // 在实际应用中，应该通过API获取员工信息
    // 这里简化处理，直接返回档案ID
    return archiveId;
}

// 获取请假类型文本
function getLeaveTypeText(leaveType) {
    const types = {
        'ANNUAL': '年假',
        'SICK': '病假',
        'PERSONAL': '事假',
        'MATERNITY': '产假',
        'PATERNITY': '陪产假',
        'MARRIAGE': '婚假'
    };
    return types[leaveType] || leaveType;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 通过请假申请
async function approveLeaveApplication(id) {
    if (!confirm('确定要通过该请假申请吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/leave-applications/${id}/approve`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('请假申请已通过');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Approve leave application error:', error);
        alert('操作失败');
    }
}

// 驳回请假申请
async function rejectLeaveApplication(id) {
    if (!confirm('确定要驳回该请假申请吗？')) {
        return;
    }
    
    try {
        const reason = prompt('请输入驳回原因:');
        if (!reason) {
            alert('请输入驳回原因');
            return;
        }
        
        const response = await fetch(`/api/hr-manager/leave-applications/${id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('请假申请已驳回');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Reject leave application error:', error);
        alert('操作失败');
    }
}

// 通过加班申请
async function approveOvertimeApplication(id) {
    if (!confirm('确定要通过该加班申请吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/overtime-applications/${id}/approve`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('加班申请已通过');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Approve overtime application error:', error);
        alert('操作失败');
    }
}

// 驳回加班申请
async function rejectOvertimeApplication(id) {
    if (!confirm('确定要驳回该加班申请吗？')) {
        return;
    }
    
    try {
        const reason = prompt('请输入驳回原因:');
        if (!reason) {
            alert('请输入驳回原因');
            return;
        }
        
        const response = await fetch(`/api/hr-manager/overtime-applications/${id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('加班申请已驳回');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Reject overtime application error:', error);
        alert('操作失败');
    }
}

// 通过调岗申请
async function approveDepartmentChangeRequest(id) {
    if (!confirm('确定要通过该调岗申请吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/department-change-requests/${id}/approve`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('调岗申请已通过');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Approve department change request error:', error);
        alert('操作失败');
    }
}

// 驳回调岗申请
async function rejectDepartmentChangeRequest(id) {
    if (!confirm('确定要驳回该调岗申请吗？')) {
        return;
    }
    
    try {
        const reason = prompt('请输入驳回原因:');
        if (!reason) {
            alert('请输入驳回原因');
            return;
        }
        
        const response = await fetch(`/api/hr-manager/department-change-requests/${id}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert('调岗申请已驳回');
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert('操作失败');
        }
    } catch (error) {
        console.error('Reject department change request error:', error);
        alert('操作失败');
    }
}

// 筛选审批数据
function filterApprovals() {
    const type = document.getElementById('approval-type').value;
    const status = document.getElementById('approval-status').value;
    
    let filteredLeaveApps = leaveApplications;
    let filteredOvertimeApps = overtimeApplications;
    let filteredDeptChangeReqs = departmentChangeRequests;
    
    // 根据状态筛选
    if (status !== 'all') {
        filteredLeaveApps = filteredLeaveApps.filter(app => app.status === status);
        filteredOvertimeApps = filteredOvertimeApps.filter(app => app.status === status);
        filteredDeptChangeReqs = filteredDeptChangeReqs.filter(req => req.status === status);
    }
    
    // 根据类型筛选并渲染对应表格
    switch (type) {
        case 'all':
            renderLeaveApprovalTable(filteredLeaveApps);
            renderOvertimeApprovalTable(filteredOvertimeApps);
            renderDepartmentChangeApprovalTable(filteredDeptChangeReqs);
            break;
        case 'leave':
            renderLeaveApprovalTable(filteredLeaveApps);
            // 隐藏其他表格
            document.getElementById('overtime-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            document.getElementById('transfer-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            break;
        case 'overtime':
            renderOvertimeApprovalTable(filteredOvertimeApps);
            // 隐藏其他表格
            document.getElementById('leave-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            document.getElementById('transfer-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            break;
        case 'transfer':
            renderDepartmentChangeApprovalTable(filteredDeptChangeReqs);
            // 隐藏其他表格
            document.getElementById('leave-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            document.getElementById('overtime-approvals-body').innerHTML = '<tr><td colspan="6" class="text-center">请选择"全部类型"或其他类型查看</td></tr>';
            break;
    }
}

// 生成报表
async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    
    try {
        let apiUrl = '';
        switch (reportType) {
            case 'attendance':
                apiUrl = '/api/hr-manager/reports/attendance-summary';
                if (startDate) apiUrl += `?startDate=${startDate}`;
                if (endDate) apiUrl += `${startDate ? '&' : '?'}endDate=${endDate}`;
                break;
            case 'leave':
                // 这里应该调用请假报表接口
                alert('请假统计报表功能尚未实现');
                return;
            case 'overtime':
                // 这里应该调用加班报表接口
                alert('加班统计报表功能尚未实现');
                return;
            case 'turnover':
                // 这里应该调用人员流动报表接口
                alert('人员流动报表功能尚未实现');
                return;
            default:
                alert('未知的报表类型');
                return;
        }
        
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (response.ok && result.success) {
            renderReport(result.data, reportType);
        } else {
            alert('生成报表失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('Generate report error:', error);
        alert('生成报表失败');
    }
}

// 渲染报表
function renderReport(data, reportType) {
    const reportContent = document.getElementById('report-content');
    const reportActions = document.getElementById('report-actions');
    
    if (!reportContent || !reportActions) return;
    
    switch (reportType) {
        case 'attendance':
            renderAttendanceReport(data);
            break;
        default:
            reportContent.innerHTML = '<p>暂不支持该类型报表</p>';
            reportActions.style.display = 'none';
            return;
    }
    
    // 显示下载按钮
    reportActions.style.display = 'block';
}

// 渲染考勤报表
function renderAttendanceReport(data) {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    if (!data || data.length === 0) {
        reportContent.innerHTML = '<p>暂无考勤数据</p>';
        return;
    }
    
    let tableHtml = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>员工姓名</th>
                    <th>总天数</th>
                    <th>出勤天数</th>
                    <th>缺勤天数</th>
                    <th>迟到次数</th>
                    <th>早退次数</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(item => {
        tableHtml += `
            <tr>
                <td>${item.employeeName}</td>
                <td>${item.totalDays}</td>
                <td>${item.attendedDays}</td>
                <td>${item.absentDays}</td>
                <td>${item.lateCount}</td>
                <td>${item.earlyLeaveCount}</td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    reportContent.innerHTML = tableHtml;
}

// 下载报表
function downloadReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    
    // 在实际应用中，这里应该调用后端下载接口或者生成CSV文件
    alert(`开始下载报表...\n类型: ${getReportTypeName(reportType)}\n开始日期: ${startDate || '无'}\n结束日期: ${endDate || '无'}`);
    
    // 示例实现：生成简单的 CSV 内容并触发下载
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    const table = reportContent.querySelector('table');
    if (!table) {
        alert('没有可下载的报表数据');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 添加表头
    const headers = [];
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(`"${th.textContent}"`);
        });
        csvContent += headers.join(',') + "\n";
    }
    
    // 添加数据行
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(td => {
            rowData.push(`"${td.textContent}"`);
        });
        csvContent += rowData.join(',') + "\n";
    });
    
    // 创建下载链接并触发下载
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 获取报表类型名称
function getReportTypeName(reportType) {
    const types = {
        'attendance': '考勤统计',
        'leave': '请假统计',
        'overtime': '加班统计',
        'turnover': '人员流动'
    };
    return types[reportType] || reportType;
}