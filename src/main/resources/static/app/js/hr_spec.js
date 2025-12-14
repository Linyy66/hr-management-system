/**
 * 人事专员页面交互逻辑
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
    initializeHRSpecPage();
});

// 初始化人事专员页面
function initializeHRSpecPage() {
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
    
    // 新增员工档案按钮
    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', toggleAddStaffForm);
    }
    
    // 新增员工档案表单提交
    const addStaffForm = document.getElementById('add-staff-form');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', handleAddStaffSubmit);
    }
    
    // 机构级联选择
    const org1Select = document.getElementById('staff-org1');
    const org2Select = document.getElementById('staff-org2');
    const org3Select = document.getElementById('staff-org3');
    const positionSelect = document.getElementById('staff-position');
    
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
    
    // 组织架构搜索功能
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleOrgSearch);
    }
    
    // 回车触发搜索
    const searchInput = document.getElementById('org-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleOrgSearch();
            }
        });
    }
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

// 切换新增员工档案表单显示
function toggleAddStaffForm() {
    const formSection = document.querySelector('#staff-archive .card:nth-child(2)');
    if (formSection) {
        formSection.style.display = formSection.style.display === 'none' ? 'block' : 'none';
        // 加载一级机构选项
        loadOrg1Options();
    }
}

// 加载一级机构选项
function loadOrg1Options() {
    const org1Select = document.getElementById('staff-org1');
    if (org1Select) {
        org1Select.innerHTML = '<option value="">请选择</option>';
        orgData.level1.forEach(org => {
            const option = document.createElement('option');
            option.value = org.org1Id;
            option.textContent = org.org1Name;
            org1Select.appendChild(option);
        });
    }
}

// 加载二级机构选项
async function loadOrg2Options(org1Id) {
    const org2Select = document.getElementById('staff-org2');
    const org3Select = document.getElementById('staff-org3');
    const positionSelect = document.getElementById('staff-position');
    
    if (org2Select) {
        org2Select.innerHTML = '<option value="">请选择</option>';
        if (org3Select) org3Select.innerHTML = '<option value="">请选择</option>';
        if (positionSelect) positionSelect.innerHTML = '<option value="">请选择</option>';
        
        if (!org1Id) {
            return;
        }
        
        try {
            const response = await fetch(`/api/hr-spec/org/level2/by-org1/${org1Id}`);
            const org2List = await response.json();
            
            org2List.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org2Id;
                option.textContent = org.org2Name;
                org2Select.appendChild(option);
            });
        } catch (error) {
            console.error('Load org2 options error:', error);
        }
    }
}

// 加载三级机构选项
async function loadOrg3Options(org2Id) {
    const org3Select = document.getElementById('staff-org3');
    const positionSelect = document.getElementById('staff-position');
    
    if (org3Select) {
        org3Select.innerHTML = '<option value="">请选择</option>';
        if (positionSelect) positionSelect.innerHTML = '<option value="">请选择</option>';
        
        if (!org2Id) {
            return;
        }
        
        try {
            const response = await fetch(`/api/hr-spec/org/level3/by-org2/${org2Id}`);
            const org3List = await response.json();
            
            org3List.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org3Id;
                option.textContent = org.org3Name;
                org3Select.appendChild(option);
            });
        } catch (error) {
            console.error('Load org3 options error:', error);
        }
    }
}

// 加载职位选项
async function loadPositionOptions(org3Id) {
    const positionSelect = document.getElementById('staff-position');
    if (positionSelect) {
        positionSelect.innerHTML = '<option value="">请选择</option>';
        
        if (!org3Id) {
            return;
        }
        
        try {
            const response = await fetch(`/api/hr-spec/positions/by-org3/${org3Id}`);
            const positions = await response.json();
            
            positions.forEach(pos => {
                const option = document.createElement('option');
                option.value = pos.positionId;
                option.textContent = pos.positionName;
                positionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Load positions error:', error);
        }
    }
}

// 处理新增员工档案提交
async function handleAddStaffSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const account = document.getElementById('staff-account').value;
    const name = document.getElementById('staff-name').value;
    const gender = document.getElementById('staff-gender').value;
    const age = document.getElementById('staff-age').value;
    const org1 = document.getElementById('staff-org1').value;
    const org2 = document.getElementById('staff-org2').value;
    const org3 = document.getElementById('staff-org3').value;
    const position = document.getElementById('staff-position').value;
    const mobile = document.getElementById('staff-mobile').value;
    const phone = document.getElementById('staff-phone').value;
    const email = document.getElementById('staff-email').value;
    const bio = document.getElementById('staff-bio').value;
    
    // 基本验证
    if (!account || !name || !gender || !age || !org1 || !org2 || !org3 || !position || !mobile) {
        alert('请填写所有必填字段');
        return;
    }
    
    try {
        const formData = {
            archiveId: account, // 使用账号作为员工档案ID
            staffName: name,
            gender: gender,
            age: parseInt(age),
            org1Id: org1,
            org2Id: org2,
            org3Id: org3,
            positionId: position,
            mobile: mobile,
            phone: phone,
            email: email,
            bio: bio
        };
        
        const response = await fetch('/api/hr-spec/staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('员工档案创建成功');
            
            // 重置表单
            document.getElementById('add-staff-form').reset();
            
            // 重新加载员工档案列表
            loadStaffArchiveData();
        } else {
            const errorData = await response.text();
            console.error('Create staff archive error response:', errorData);
            alert('创建员工档案失败: ' + errorData);
        }
    } catch (error) {
        console.error('Create staff archive error:', error);
        alert('创建员工档案失败，请稍后重试');
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        // 获取待处理的员工档案数量
        const staffResponse = await fetch('/api/hr-spec/staff');
        const staffArchives = await staffResponse.json();
        const pendingArchives = staffArchives.filter(archive => archive.status === 'PENDING').length;
        
        // 获取考勤异常数量（这里我们假设有一个API可以获取）
        // 由于没有直接的API，我们暂时使用模拟数据
        document.getElementById('pending-archives').textContent = pendingArchives;
        document.getElementById('attendance-exceptions').textContent = '5';
        document.getElementById('new-hires').textContent = '2';
        document.getElementById('resignations').textContent = '1';
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
        
        // 如果当前在组织架构面板，显示组织架构
        if (currentPane === 'org') {
            displayOrgStructure();
        }
    } catch (error) {
        console.error('Load organization data error:', error);
    }
}

// 显示组织架构
function displayOrgStructure() {
    displayLevel1Orgs();
}

// 显示一级机构
function displayLevel1Orgs() {
    const container = document.getElementById('org-level1-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    orgData.level1.forEach(org => {
        const orgElement = document.createElement('div');
        orgElement.className = 'org-item level1';
        orgElement.innerHTML = `
            <div class="org-header">
                <span class="org-name">${org.org1Name}</span>
                <button class="btn-small btn-secondary" onclick="expandLevel2('${org.org1Id}')">查看下级机构</button>
            </div>
        `;
        container.appendChild(orgElement);
    });
}

// 展开二级机构
function expandLevel2(org1Id) {
    const level2Container = document.getElementById('org-level2-list');
    if (!level2Container) return;
    
    level2Container.innerHTML = '';
    
    const level2Orgs = orgData.level2.filter(org => org.org1Id === org1Id);
    level2Orgs.forEach(org => {
        const orgElement = document.createElement('div');
        orgElement.className = 'org-item level2';
        orgElement.innerHTML = `
            <div class="org-header">
                <span class="org-name">${org.org2Name}</span>
                <button class="btn-small btn-secondary" onclick="expandLevel3('${org.org2Id}')">查看下级机构</button>
            </div>
        `;
        level2Container.appendChild(orgElement);
    });
}

// 展开三级机构
function expandLevel3(org2Id) {
    const level3Container = document.getElementById('org-level3-list');
    if (!level3Container) return;
    
    level3Container.innerHTML = '';
    
    const level3Orgs = orgData.level3.filter(org => org.org2Id === org2Id);
    level3Orgs.forEach(org => {
        const orgElement = document.createElement('div');
        orgElement.className = 'org-item level3';
        orgElement.innerHTML = `
            <div class="org-header">
                <span class="org-name">${org.org3Name}</span>
                <button class="btn-small btn-secondary" onclick="loadPositions('${org.org3Id}')">查看职位</button>
            </div>
        `;
        level3Container.appendChild(orgElement);
    });
}

// 加载职位
async function loadPositions(org3Id) {
    const positionContainer = document.getElementById('position-list');
    if (!positionContainer) return;
    
    positionContainer.innerHTML = '<p>正在加载职位...</p>';
    
    try {
        const response = await fetch(`/api/hr-spec/positions/by-org3/${org3Id}`);
        const positions = await response.json();
        
        positionContainer.innerHTML = '';
        
        if (positions.length === 0) {
            positionContainer.innerHTML = '<p>该机构下暂无职位</p>';
            return;
        }
        
        positions.forEach(position => {
            const positionElement = document.createElement('div');
            positionElement.className = 'position-item';
            positionElement.innerHTML = `
                <div class="position-header">
                    <span class="position-name">${position.positionName}</span>
                    <button class="btn-small btn-secondary" onclick="loadStaffByPosition('${position.positionId}')">查看员工</button>
                </div>
            `;
            positionContainer.appendChild(positionElement);
        });
    } catch (error) {
        console.error('Load positions error:', error);
        positionContainer.innerHTML = '<p>加载职位失败</p>';
    }
}

// 根据职位加载员工
async function loadStaffByPosition(positionId) {
    const staffContainer = document.getElementById('staff-list');
    if (!staffContainer) return;
    
    staffContainer.innerHTML = '<p>正在加载员工...</p>';
    
    try {
        const response = await fetch(`/api/hr-spec/staff`);
        const staffList = await response.json();
        
        // 筛选出该职位下的员工
        const filteredStaff = staffList.filter(staff => staff.positionId === positionId);
        
        staffContainer.innerHTML = '';
        
        if (filteredStaff.length === 0) {
            staffContainer.innerHTML = '<p>该职位暂无员工</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>员工编号</th>
                    <th>姓名</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="staff-table-body">
            </tbody>
        `;
        
        const tbody = table.querySelector('#staff-table-body');
        filteredStaff.forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.archiveId}</td>
                <td>${staff.staffName}</td>
                <td>${getStaffArchiveStatusDescription(staff.status)}</td>
                <td>
                    <button class="btn-small btn-primary" onclick="viewStaffDetails('${staff.staffId}')">查看详情</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        staffContainer.appendChild(table);
    } catch (error) {
        console.error('Load staff error:', error);
        staffContainer.innerHTML = '<p>加载员工失败</p>';
    }
}

// 查看员工详情
function viewStaffDetails(staffId) {
    alert(`查看员工详情: ${staffId}\n在实际应用中，这里会显示员工的详细信息。`);
}

// 处理组织架构搜索
async function handleOrgSearch() {
    const searchInput = document.getElementById('org-search');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        alert('请输入搜索关键词');
        return;
    }
    
    try {
        // 搜索部门（三级机构）
        const orgResults = searchOrgs(keyword);
        
        // 搜索职位
        const positionResults = await searchPositions(keyword);
        
        // 搜索员工
        const staffResults = await searchStaff(keyword);
        
        // 显示搜索结果
        displaySearchResults(orgResults, positionResults, staffResults);
    } catch (error) {
        console.error('Search error:', error);
        alert('搜索失败，请稍后重试');
    }
}

// 搜索部门
function searchOrgs(keyword) {
    const results = [];
    
    // 在三级机构中搜索
    orgData.level3.forEach(org3 => {
        if (org3.org3Name.includes(keyword)) {
            // 找到对应的二级机构
            const org2 = orgData.level2.find(o2 => o2.org2Id === org3.org2Id);
            // 找到对应的一级机构
            const org1 = orgData.level1.find(o1 => o1.org1Id === org2.org1Id);
            
            results.push({
                level1: org1,
                level2: org2,
                level3: org3
            });
        }
    });
    
    return results;
}

// 搜索职位
async function searchPositions(keyword) {
    try {
        const response = await fetch('/api/hr-spec/positions');
        const positions = await response.json();
        
        // 过滤包含关键词的职位
        return positions.filter(pos => pos.positionName.includes(keyword));
    } catch (error) {
        console.error('Search positions error:', error);
        return [];
    }
}

// 搜索员工
async function searchStaff(keyword) {
    try {
        const response = await fetch('/api/hr-spec/staff');
        const staffList = await response.json();
        
        // 过滤包含关键词的员工
        return staffList.filter(staff => 
            staff.staffName.includes(keyword) || 
            staff.archiveId.includes(keyword) ||
            (staff.accountId && staff.accountId.includes(keyword))
        );
    } catch (error) {
        console.error('Search staff error:', error);
        return [];
    }
}

// 显示搜索结果
function displaySearchResults(orgResults, positionResults, staffResults) {
    // 显示部门搜索结果
    const orgLevel3List = document.getElementById('org-level3-list');
    if (orgLevel3List) {
        orgLevel3List.innerHTML = '';
        
        if (orgResults.length > 0) {
            orgResults.forEach(result => {
                const orgElement = document.createElement('div');
                orgElement.className = 'org-item search-result';
                orgElement.innerHTML = `
                    <div class="org-header">
                        <span class="org-name">${result.level1.org1Name} > ${result.level2.org2Name} > ${result.level3.org3Name}</span>
                    </div>
                `;
                orgLevel3List.appendChild(orgElement);
            });
        } else {
            orgLevel3List.innerHTML = '<p>未找到匹配的部门</p>';
        }
    }
    
    // 显示职位搜索结果
    const positionList = document.getElementById('position-list');
    if (positionList) {
        positionList.innerHTML = '';
        
        if (positionResults.length > 0) {
            positionResults.forEach(position => {
                // 查找职位所属的三级机构
                const org3 = orgData.level3.find(org => org.org3Id === position.org3Id);
                const org2 = org3 ? orgData.level2.find(org => org.org2Id === org3.org2Id) : null;
                const org1 = org2 ? orgData.level1.find(org => org.org1Id === org2.org1Id) : null;
                
                const orgPath = org1 && org2 && org3 ? 
                    `${org1.org1Name} > ${org2.org2Name} > ${org3.org3Name}` : 
                    '未知机构';
                
                const positionElement = document.createElement('div');
                positionElement.className = 'position-item search-result';
                positionElement.innerHTML = `
                    <div class="position-header">
                        <span class="position-name">${position.positionName} (${orgPath})</span>
                    </div>
                `;
                positionList.appendChild(positionElement);
            });
        } else {
            positionList.innerHTML = '<p>未找到匹配的职位</p>';
        }
    }
    
    // 显示员工搜索结果
    const staffList = document.getElementById('staff-list');
    if (staffList) {
        staffList.innerHTML = '';
        
        if (staffResults.length > 0) {
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>员工编号</th>
                        <th>姓名</th>
                        <th>账号</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="search-staff-table-body">
                </tbody>
            `;
            
            const tbody = table.querySelector('#search-staff-table-body');
            staffResults.forEach(staff => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${staff.archiveId}</td>
                    <td>${staff.staffName}</td>
                    <td>${staff.accountId || '无'}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick="viewStaffDetails('${staff.archiveId}')">查看详情</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            staffList.appendChild(table);
        } else {
            staffList.innerHTML = '<p>未找到匹配的员工</p>';
        }
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
                case 'staff-archive':
                    currentPageTitle.textContent = '员工档案管理';
                    // 加载员工档案数据
                    loadStaffArchiveData();
                    break;
                case 'attendance':
                    currentPageTitle.textContent = '考勤管理';
                    // 加载考勤数据
                    loadAttendanceData();
                    break;
                case 'org':
                    currentPageTitle.textContent = '组织架构管理';
                    // 显示组织架构
                    displayOrgStructure();
                    break;
                default:
                    currentPageTitle.textContent = '人事专员';
            }
        }
    }
}

// 加载员工档案数据
async function loadStaffArchiveData() {
    try {
        const response = await fetch('/api/hr-spec/staff');
        const staffArchives = await response.json();
        
        const tbody = document.getElementById('staff-archive-body');
        if (tbody) {
            tbody.innerHTML = '';
            staffArchives.forEach(archive => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${archive.archiveId}</td>
                    <td>${archive.accountId || '无'}</td>
                    <td>${archive.staffName}</td>
                    <td>${archive.gender === 'M' ? '男' : (archive.gender === 'F' ? '女' : archive.gender)}</td>
                    <td>${getOrgFullName(archive.org1Id, archive.org2Id, archive.org3Id)}</td>
                    <td>${archive.positionId}</td>
                    <td>${archive.mobile}</td>
                    <td>${getStaffArchiveStatusDescription(archive.status)}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick="viewStaffArchive('${archive.archiveId}')">查看</button>
                        <button class="btn-small btn-secondary" onclick="editStaffArchive('${archive.archiveId}')">编辑</button>
                        <button class="btn-small btn-danger" onclick="deleteStaffArchive('${archive.archiveId}')">删除</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Load staff archive data error:', error);
    }
}

// 获取组织全名
function getOrgFullName(org1Id, org2Id, org3Id) {
    const org1 = orgData.level1.find(org => org.org1Id === org1Id);
    const org2 = orgData.level2.find(org => org.org2Id === org2Id);
    const org3 = orgData.level3.find(org => org.org3Id === org3Id);
    
    return `${org1 ? org1.org1Name : ''} > ${org2 ? org2.org2Name : ''} > ${org3 ? org3.org3Name : ''}`;
}

// 获取员工档案状态描述
function getStaffArchiveStatusDescription(status) {
    switch (status) {
        case 'PENDING':
            return '待审批';
        case 'NORMAL':
            return '正常';
        case 'DELETED':
            return '已删除';
        case 'REJECTED':
            return '已拒绝';
        default:
            return status;
    }
}

// 查看员工档案
function viewStaffArchive(id) {
    // 在实际应用中，这里应该从后端获取员工档案详情
    alert(`查看员工档案: ${id}\n在实际应用中，这里会显示员工的详细信息。`);
}

// 编辑员工档案
function editStaffArchive(id) {
    // 在实际应用中，这里应该打开编辑模态框并预填数据
    alert(`编辑员工档案: ${id}\n在实际应用中，这里会打开编辑界面。`);
}

// 删除员工档案
async function deleteStaffArchive(id) {
    if (!confirm('确定要删除这个员工档案吗？')) {
        return;
    }
    
    try {
        // 在实际应用中，这里应该发送请求到后端删除员工档案
        console.log('Deleting staff archive:', id);
        alert(`员工档案 ${id} 已删除`);
        
        // 重新加载员工档案列表
        loadStaffArchiveData();
    } catch (error) {
        console.error('Delete staff archive error:', error);
        alert('删除员工档案失败，请稍后重试');
    }
}

// 加载考勤数据
async function loadAttendanceData() {
    try {
        // 模拟从后端获取考勤数据
        const normalAttendances = [
            {
                workId: 'W001',
                staffName: '张三',
                staffAccount: 'zhangsan',
                date: '2025-12-14',
                clockIn: '09:00',
                clockOut: '18:00',
                status: '正常'
            },
            {
                workId: 'W002',
                staffName: '李四',
                staffAccount: 'lisi',
                date: '2025-12-14',
                clockIn: '08:50',
                clockOut: '17:55',
                status: '正常'
            }
        ];
        
        const abnormalAttendances = [
            {
                workId: 'W003',
                staffName: '王五',
                staffAccount: 'wangwu',
                date: '2025-12-14',
                clockIn: '09:30',
                clockOut: '18:00',
                status: '迟到'
            },
            {
                workId: 'W004',
                staffName: '赵六',
                staffAccount: 'zhaoliu',
                date: '2025-12-14',
                clockIn: '',
                clockOut: '',
                status: '缺卡'
            }
        ];
        
        // 渲染正常考勤记录
        const normalBody = document.getElementById('normal-attendance-body');
        if (normalBody) {
            normalBody.innerHTML = '';
            normalAttendances.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${record.workId}</td>
                    <td>${record.staffName}</td>
                    <td>${record.staffAccount}</td>
                    <td>${record.date}</td>
                    <td>${record.clockIn || '-'}</td>
                    <td>${record.clockOut || '-'}</td>
                    <td>${record.status}</td>
                    <td>
                        <button class="btn-small btn-danger" onclick="markAsAbnormal('${record.workId}')">标记异常</button>
                    </td>
                `;
                normalBody.appendChild(tr);
            });
        }
        
        // 渲染异常考勤记录
        const abnormalBody = document.getElementById('abnormal-attendance-body');
        if (abnormalBody) {
            abnormalBody.innerHTML = '';
            abnormalAttendances.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${record.workId}</td>
                    <td>${record.staffName}</td>
                    <td>${record.staffAccount}</td>
                    <td>${record.date}</td>
                    <td>${record.clockIn || '-'}</td>
                    <td>${record.clockOut || '-'}</td>
                    <td>${record.status}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick="approveAttendance('${record.workId}')">审批</button>
                    </td>
                `;
                abnormalBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Load attendance data error:', error);
    }
}

// 标记为异常
async function markAsAbnormal(workId) {
    if (!confirm('确定要将此考勤记录标记为异常吗？')) {
        return;
    }
    
    try {
        // 模拟标记为异常的操作
        alert(`考勤记录 ${workId} 已标记为异常`);
        // 重新加载数据
        loadAttendanceData();
    } catch (error) {
        console.error('Mark as abnormal error:', error);
        alert('操作失败，请稍后重试');
    }
}

// 审批考勤记录
async function approveAttendance(workId) {
    if (!confirm('确定要审批通过此考勤异常记录吗？')) {
        return;
    }
    
    try {
        // 模拟审批操作
        alert(`考勤异常记录 ${workId} 已审批通过`);
        // 重新加载数据
        loadAttendanceData();
    } catch (error) {
        console.error('Approve attendance error:', error);
        alert('操作失败，请稍后重试');
    }
}