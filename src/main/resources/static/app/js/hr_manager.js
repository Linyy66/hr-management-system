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
    
    // 考勤规则相关事件
    const addRuleBtn = document.getElementById('add-rule-btn');
    if (addRuleBtn) {
        addRuleBtn.addEventListener('click', openAddRuleModal);
    }
    
    const ruleModal = document.getElementById('rule-modal');
    if (ruleModal) {
        const closeBtn = ruleModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-rule');
        const submitBtn = document.getElementById('submit-rule');
        
        if (closeBtn) closeBtn.addEventListener('click', closeRuleModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeRuleModal);
        if (submitBtn) submitBtn.addEventListener('click', handleRuleSubmit);
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
        
        // 填充三级机构下拉框（用于考勤规则）
        populateOrg3Select();
    } catch (error) {
        console.error('Load organization data error:', error);
    }
}

// 填充三级机构下拉框
function populateOrg3Select() {
    const select = document.getElementById('rule-org3');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择三级机构</option>';
    
    orgData.level3.forEach(org3 => {
        // 查找对应的二级机构
        const level2Org = orgData.level2.find(o => o.org2Id === org3.org2Id);
        // 查找对应的一级机构
        const level1Org = level2Org ? orgData.level1.find(o => o.org1Id === level2Org.org1Id) : null;
        
        const option = document.createElement('option');
        option.value = org3.org3Id;
        option.textContent = `${level1Org ? level1Org.org1Name : ''} > ${level2Org ? level2Org.org2Name : ''} > ${org3.org3Name}`;
        select.appendChild(option);
    });
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
                case 'attendance-rules':
                    currentPageTitle.textContent = '考勤规则管理';
                    loadAttendanceRules(); // 加载考勤规则数据
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
            <td>${staff.archiveId}</td>
            <td>${staff.staffName}</td>
            <td>${staff.gender === 'M' ? '男' : (staff.gender === 'F' ? '女' : staff.gender)}</td>
            <td>${getOrgFullName(staff.org1Id, staff.org2Id, staff.org3Id)}</td>
            <td>${staff.positionId}</td>
            <td>${staff.mobile}</td>
            <td>${getStatusText(staff.status)}</td>
            <td>
                ${staff.status === 'RESIGN_PENDING' ? 
                  `<button class="btn-small btn-primary" onclick="approveResignation('${staff.archiveId}')">批准离职</button>
                   <button class="btn-small btn-danger" onclick="rejectResignation('${staff.archiveId}')">拒绝离职</button>` :
                  `<button class="btn-small btn-primary" onclick="viewStaffDetails('${staff.archiveId}')">查看</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 获取组织全名
function getOrgFullName(org1Id, org2Id, org3Id) {
    // 尝试从全局orgData中获取组织名称
    if (typeof orgData !== 'undefined' && orgData.level1 && orgData.level2 && orgData.level3) {
        const org1 = orgData.level1.find(org => org.org1Id === org1Id);
        const org2 = orgData.level2.find(org => org.org2Id === org2Id);
        const org3 = orgData.level3.find(org => org.org3Id === org3Id);
        
        return `${org1 ? org1.org1Name : org1Id} > ${org2 ? org2.org2Name : org2Id} > ${org3 ? org3.org3Name : org3Id}`;
    }
    
    // 如果没有全局orgData，则使用模拟数据
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
        case 'RESIGNED':
            return '已离职';
        case 'RESIGN_PENDING':
            return '离职申请中';
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

员工编号: ${staff.archiveId}
姓名: ${staff.staffName}
性别: ${staff.gender === 'M' ? '男' : (staff.gender === 'F' ? '女' : staff.gender)}
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

// 批准员工离职申请
async function approveResignation(staffId) {
    if (!confirm('确定要批准该员工的离职申请吗？批准后该员工账户将被禁用。')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/staff/${staffId}/approve-resignation`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('员工离职申请已批准，账户已禁用');
            // 重新加载员工数据
            loadStaffData();
        } else {
            alert(`操作失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Approve resignation error:', error);
        alert('操作失败');
    }
}

// 拒绝员工离职申请
async function rejectResignation(staffId) {
    if (!confirm('确定要拒绝该员工的离职申请吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/staff/${staffId}/reject-resignation`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('员工离职申请已拒绝');
            // 重新加载员工数据
            loadStaffData();
        } else {
            alert(`操作失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Reject resignation error:', error);
        alert('操作失败');
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
            (staff.accountId && staff.accountId.includes(keyword)) || 
            staff.archiveId.includes(keyword)
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
        
        // 加载离职申请
        const resignationResponse = await fetch('/api/hr-manager/resignation-applications');
        resignationApplications = await resignationResponse.json();
        
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
    renderResignationApprovalTable(resignationApplications);
}

// 渲染请假审批表格
function renderLeaveApprovalTable(applications) {
    const tbody = document.getElementById('leave-approvals-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    applications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applicantName || '未知'}</td>
            <td>${app.leaveType ? getLeaveTypeDescription(app.leaveType) : ''}</td>
            <td>${app.startDate ? new Date(app.startDate).toLocaleDateString() : ''}</td>
            <td>${app.endDate ? new Date(app.endDate).toLocaleDateString() : ''}</td>
            <td>${app.leaveDays || ''}</td>
            <td>${app.applyTime ? new Date(app.applyTime).toLocaleString() : ''}</td>
            <td>${app.approvalStatus ? getApprovalStatusDescription(app.approvalStatus) : ''}</td>
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
    applications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applicantName || '未知'}</td>
            <td>${app.workDate ? new Date(app.workDate).toLocaleDateString() : ''}</td>
            <td>${app.overtimeHours || ''}</td>
            <td>${app.applyTime ? new Date(app.applyTime).toLocaleString() : ''}</td>
            <td>${app.approvalStatus ? getApprovalStatusDescription(app.approvalStatus) : ''}</td>
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
    requests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.applicantName || '未知'}</td>
            <td>${req.oldDepartment || ''}</td>
            <td>${req.newDepartment || ''}</td>
            <td>${req.applyTime ? new Date(req.applyTime).toLocaleString() : ''}</td>
            <td>${req.approvalStatus ? getApprovalStatusDescription(req.approvalStatus) : ''}</td>
            <td>
                <button class="btn-small btn-primary" onclick="approveTransferRequest(${req.id})">通过</button>
                <button class="btn-small btn-danger" onclick="rejectTransferRequest(${req.id})">驳回</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 渲染离职审批表格
function renderResignationApprovalTable(applications) {
    const tbody = document.getElementById('resignation-approvals-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    applications.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applicantName || '未知'}</td>
            <td>${app.createTime ? new Date(app.createTime).toLocaleString() : ''}</td>
            <td>${app.approvalStatus ? getApprovalStatusDescription(app.approvalStatus) : ''}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewResignationApplication(${app.id})">查看详情</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 查看离职申请详情
async function viewResignationApplication(id) {
    try {
        const response = await fetch(`/api/hr-manager/resignation-applications/${id}`);
        const application = await response.json();
        
        if (response.ok) {
            // 显示模态框并填充数据
            document.getElementById('resignation-applicant').textContent = application.applicantName || '未知';
            document.getElementById('resignation-apply-time').textContent = application.createTime ? new Date(application.createTime).toLocaleString() : '';
            document.getElementById('resignation-status').textContent = application.approvalStatus ? getApprovalStatusDescription(application.approvalStatus) : '';
            document.getElementById('resignation-reason-detail').value = application.reason || '';
            
            // 绑定审批按钮事件
            document.getElementById('approve-resignation-btn').onclick = () => approveResignationApplication(id);
            document.getElementById('reject-resignation-btn').onclick = () => rejectResignationApplication(id);
            
            // 显示模态框
            document.getElementById('resignation-detail-modal').style.display = 'block';
        } else {
            alert('获取离职申请详情失败');
        }
    } catch (error) {
        console.error('View resignation application error:', error);
        alert('获取离职申请详情失败');
    }
}

// 关闭离职申请详情模态框
function closeResignationDetailModal() {
    document.getElementById('resignation-detail-modal').style.display = 'none';
}

// 批准离职申请
async function approveResignationApplication(id) {
    if (!confirm('确定要批准该员工的离职申请吗？批准后该员工账户将被禁用。')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/resignation-applications/${id}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('员工离职申请已批准，账户已禁用');
            closeResignationDetailModal();
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert(`操作失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Approve resignation error:', error);
        alert('操作失败');
    }
}

// 拒绝离职申请
async function rejectResignationApplication(id) {
    if (!confirm('确定要拒绝该员工的离职申请吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/resignation-applications/${id}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('员工离职申请已拒绝');
            closeResignationDetailModal();
            // 重新加载审批数据
            loadApprovalData();
        } else {
            alert(`操作失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Reject resignation error:', error);
        alert('操作失败');
    }
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

// 获取审批状态描述
function getApprovalStatusDescription(status) {
    switch (status) {
        case 'PENDING':
            return '待审批';
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

// 加载考勤规则数据
async function loadAttendanceRules() {
    try {
        const response = await fetch('/api/hr-manager/attendance-rules');
        const result = await response.json();
        const rules = result.data || [];
        renderRulesTable(rules);
    } catch (error) {
        console.error('Load attendance rules error:', error);
        alert('加载考勤规则失败');
    }
}

// 渲染规则表格
function renderRulesTable(rules) {
    const tbody = document.getElementById('rules-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!rules || rules.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6">暂无考勤规则</td>';
        tbody.appendChild(tr);
        return;
    }
    
    rules.forEach(rule => {
        // 解析规则JSON
        let ruleDetails = {};
        try {
            ruleDetails = JSON.parse(rule.ruleJson);
        } catch (e) {
            console.error('Parse rule JSON error:', e);
        }
        
        // 获取适用机构信息
        let orgInfo = '未知机构';
        if (rule.org3Id) {
            const org3 = orgData.level3.find(o => o.org3Id === rule.org3Id);
            if (org3) {
                const org2 = orgData.level2.find(o => o.org2Id === org3.org2Id);
                const org1 = org2 ? orgData.level1.find(o => o.org1Id === org2.org1Id) : null;
                orgInfo = `${org1 ? org1.org1Name : ''} > ${org2 ? org2.org2Name : ''} > ${org3.org3Name}`;
            }
        }
        
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td>${ruleDetails.name || '未命名规则'}</td>
            <td>${orgInfo}</td>
            <td>${ruleDetails.workStart || '-'}</td>
            <td>${ruleDetails.workEnd || '-'}</td>
            <td>${rule.status === 'ACTIVE' ? '启用' : '停用'}</td>
            <td>
                <button class="btn-small btn-primary" onclick='editRule(${JSON.stringify(rule).replace(/'/g, "\\'")})'>编辑</button>
                <button class="btn-small btn-danger" onclick="deleteRule(${rule.id})">删除</button>
            </td>
        `;
        tr.addEventListener('click', (event) => {
            // 阻止按钮点击时触发行点击事件
            if (event.target.tagName !== 'BUTTON') {
                editRule(rule);
            }
        });
        tbody.appendChild(tr);
    });
}

// 打开新增规则模态框
function openAddRuleModal() {
    const modal = document.getElementById('rule-modal');
    if (!modal) return;
    
    // 清空表单
    document.getElementById('rule-form').reset();
    document.getElementById('rule-id').value = '';
    document.getElementById('rule-modal-title').textContent = '新增考勤规则';
    
    // 设置默认上班下班时间
    document.getElementById('work-start-time').value = '09:00';
    document.getElementById('work-end-time').value = '18:00';
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭规则模态框
function closeRuleModal() {
    const modal = document.getElementById('rule-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 编辑规则
function editRule(rule) {
    const modal = document.getElementById('rule-modal');
    if (!modal) return;
    
    // 填充表单数据
    document.getElementById('rule-id').value = rule.id || '';
    
    // 解析规则JSON
    let ruleDetails = {};
    try {
        ruleDetails = JSON.parse(rule.ruleJson);
    } catch (e) {
        console.error('Parse rule JSON error:', e);
    }
    
    document.getElementById('rule-name').value = ruleDetails.name || '';
    document.getElementById('rule-org3').value = rule.org3Id || '';
    document.getElementById('work-start-time').value = ruleDetails.workStart || '09:00';
    document.getElementById('work-end-time').value = ruleDetails.workEnd || '18:00';
    document.getElementById('rule-status').value = rule.status || 'ACTIVE';
    document.getElementById('rule-modal-title').textContent = '编辑考勤规则';
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 处理规则提交
async function handleRuleSubmit() {
    const id = document.getElementById('rule-id').value;
    const name = document.getElementById('rule-name').value.trim();
    const org3Id = document.getElementById('rule-org3').value;
    const workStart = document.getElementById('work-start-time').value;
    const workEnd = document.getElementById('work-end-time').value;
    const status = document.getElementById('rule-status').value;
    
    // 基本验证
    if (!name) {
        alert('请输入规则名称');
        return;
    }
    
    if (!org3Id) {
        alert('请选择适用的三级机构');
        return;
    }
    
    if (!workStart || !workEnd) {
        alert('请设置上班时间和下班时间');
        return;
    }
    
    // 构造规则JSON
    const ruleJson = JSON.stringify({
        name: name,
        workStart: workStart,
        workEnd: workEnd
    });
    
    try {
        let response;
        const requestData = {
            org3Id: org3Id,
            ruleJson: ruleJson,
            status: status
        };
        
        if (id) {
            // 更新规则
            response = await fetch(`/api/hr-manager/attendance-rules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
        } else {
            // 创建规则
            response = await fetch('/api/hr-manager/attendance-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
        }
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(id ? '规则更新成功' : '规则创建成功');
            closeRuleModal();
            loadAttendanceRules(); // 重新加载规则列表
        } else {
            alert('操作失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('Save rule error:', error);
        alert('保存规则时发生错误，请稍后重试');
    }
}

// 删除规则
async function deleteRule(id) {
    if (!confirm('确定要删除这条考勤规则吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hr-manager/attendance-rules/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('规则删除成功');
            loadAttendanceRules(); // 重新加载规则列表
        } else {
            const result = await response.json();
            alert('删除失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('Delete rule error:', error);
        alert('删除规则时发生错误，请稍后重试');
    }
}

// 加载一级机构选项
async function loadOrg1Options() {
    const org1Select = document.getElementById('staff-org1');
    if (org1Select) {
        org1Select.innerHTML = '<option value="">请选择</option>';
        
        try {
            const response = await fetch('/api/hr-spec/org/level1');
            const org1List = await response.json();
            
            org1List.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org1Id;
                option.textContent = org.org1Name;
                org1Select.appendChild(option);
            });
        } catch (error) {
            console.error('Load org1 options error:', error);
        }
    }
    
    // 同时为调岗申请模态框加载一级机构选项
    const transferOrg1Select = document.getElementById('transfer-org1');
    if (transferOrg1Select) {
        transferOrg1Select.innerHTML = '<option value="">请选择</option>';
        
        try {
            const response = await fetch('/api/hr-spec/org/level1');
            const org1List = await response.json();
            
            org1List.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org1Id;
                option.textContent = org.org1Name;
                transferOrg1Select.appendChild(option);
            });
        } catch (error) {
            console.error('Load org1 options for transfer error:', error);
        }
    }
}