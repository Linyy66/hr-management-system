/**
 * 管理员页面交互逻辑
 */

// 当前活动面板
let currentPane = 'org'; // 默认显示组织架构面板
let orgData = {
    level1: [],
    level2: [],
    level3: []
};
let currentOrg = null; // 当前正在编辑的机构
let isViewMode = false; // 是否为查看模式

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
    
    // 加载组织数据
    loadOrgData();
    
    // 设置默认生效日期为今天
    const today = new Date().toISOString().split('T')[0];
    const effectiveDateInput = document.getElementById('effective-date');
    if (effectiveDateInput) effectiveDateInput.value = today;
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
    
    // 查看/新增机构切换按钮
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', toggleViewMode);
    }
    
    // 保存机构按钮
    const saveOrgBtn = document.getElementById('save-org-btn');
    if (saveOrgBtn) {
        saveOrgBtn.addEventListener('click', saveOrg);
    }
    
    // 重置表单按钮
    const resetFormBtn = document.getElementById('reset-form-btn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetOrgForm);
    }
    
    // 新增用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
    
    // 新增职位按钮
    const addPositionBtn = document.getElementById('add-position-btn');
    if (addPositionBtn) {
        addPositionBtn.addEventListener('click', openAddPositionModal);
    }
    
    // 机构层级单选按钮（内嵌表单）
    const orgLevelRadios = document.querySelectorAll('input[name="orgLevel"]');
    orgLevelRadios.forEach(radio => {
        radio.addEventListener('change', handleOrgLevelChange);
    });
    
    // 父级机构选择框（内嵌表单）
    const parentLevel1Select = document.getElementById('parent-level1');
    if (parentLevel1Select) {
        parentLevel1Select.addEventListener('change', handleParentLevel1Change);
    }
    
    const parentLevel2Select = document.getElementById('parent-level2');
    if (parentLevel2Select) {
        parentLevel2Select.addEventListener('change', handleParentLevel2Change);
    }
    
    // 机构代码输入框（内嵌表单）
    const orgCodeInput = document.getElementById('org-code');
    if (orgCodeInput) {
        orgCodeInput.addEventListener('input', handleOrgCodeInput);
    }
    
    // 全选复选框
    const selectAllLevel1 = document.getElementById('select-all-level1');
    if (selectAllLevel1) {
        selectAllLevel1.addEventListener('change', function() {
            toggleSelectAll(1, this.checked);
        });
    }
    
    const selectAllLevel2 = document.getElementById('select-all-level2');
    if (selectAllLevel2) {
        selectAllLevel2.addEventListener('change', function() {
            toggleSelectAll(2, this.checked);
        });
    }
    
    const selectAllLevel3 = document.getElementById('select-all-level3');
    if (selectAllLevel3) {
        selectAllLevel3.addEventListener('change', function() {
            toggleSelectAll(3, this.checked);
        });
    }
    
    // 用户管理模态框相关事件
    const addUserModal = document.getElementById('add-user-modal');
    if (addUserModal) {
        const closeBtn = addUserModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-add-user');
        const submitBtn = document.getElementById('submit-add-user');
        
        if (closeBtn) closeBtn.addEventListener('click', closeAddUserModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeAddUserModal);
        if (submitBtn) submitBtn.addEventListener('click', handleAddUserSubmit);
    }
    
    // 编辑用户模态框相关事件
    const editUserModal = document.getElementById('edit-user-modal');
    if (editUserModal) {
        const closeBtn = editUserModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-edit-user');
        const submitBtn = document.getElementById('submit-edit-user');
        
        if (closeBtn) closeBtn.addEventListener('click', closeEditUserModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditUserModal);
        if (submitBtn) submitBtn.addEventListener('click', handleEditUserSubmit);
    }
    
    // 职位管理模态框相关事件
    const addPositionModal = document.getElementById('add-position-modal');
    if (addPositionModal) {
        const closeBtn = addPositionModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-add-position');
        const submitBtn = document.getElementById('submit-add-position');
        
        if (closeBtn) closeBtn.addEventListener('click', closeAddPositionModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeAddPositionModal);
        if (submitBtn) submitBtn.addEventListener('click', handleAddPositionSubmit);
    }
}

// 处理机构层级变更（模态框）
function handleModalOrgLevelChange() {
    const selectedLevelElement = document.querySelector('#add-org-modal input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Group = document.getElementById('modal-parent-level1-group');
    const parentLevel2Group = document.getElementById('modal-parent-level2-group');
    const orgCodeInput = document.getElementById('modal-org-code');
    
    // 清空机构代码输入框
    if (orgCodeInput) orgCodeInput.value = '';
    
    // 根据选择的层级显示相应的父级选择器
    switch (selectedLevel) {
        case 1:
            if (parentLevel1Group) parentLevel1Group.style.display = 'none';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none';
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 2:
            if (parentLevel1Group) parentLevel1Group.style.display = 'block';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none';
            populateModalParentLevel1Select();
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 3:
            if (parentLevel1Group) parentLevel1Group.style.display = 'block';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none'; // 初始隐藏，选择一级后再显示
            populateModalParentLevel1Select();
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
    }
}

// 填充一级机构选择框（模态框）
function populateModalParentLevel1Select() {
    const select = document.getElementById('modal-parent-level1');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择一级机构</option>';
    
    orgData.level1.forEach(org => {
        const option = document.createElement('option');
        option.value = org.org1Id;
        option.textContent = org.org1Name;
        select.appendChild(option);
    });
}

// 处理一级机构选择变更（模态框）
function handleModalParentLevel1Change() {
    const selectedLevelElement = document.querySelector('#add-org-modal input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Value = document.getElementById('modal-parent-level1').value;
    const parentLevel2Group = document.getElementById('modal-parent-level2-group');
    const parentLevel2Select = document.getElementById('modal-parent-level2');
    const orgCodeInput = document.getElementById('modal-org-code');
    
    if (selectedLevel === 3 && parentLevel1Value) {
        if (parentLevel2Group) parentLevel2Group.style.display = 'block';
        populateModalParentLevel2Select(parentLevel1Value);
    } else {
        if (parentLevel2Group) parentLevel2Group.style.display = 'none';
        if (parentLevel2Select) {
            parentLevel2Select.innerHTML = '<option value="">请选择二级机构</option>';
        }
    }
    
    // 更新机构代码前缀
    updateModalOrgCodePrefix();
}

// 填充二级机构选择框（模态框）
function populateModalParentLevel2Select(parentLevel1Id) {
    const select = document.getElementById('modal-parent-level2');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择二级机构</option>';
    
    // 筛选出属于指定一级机构的二级机构
    const filteredOrgs = orgData.level2.filter(org => org.org1Id === parentLevel1Id);
    
    filteredOrgs.forEach(org => {
        const option = document.createElement('option');
        option.value = org.org2Id;
        option.textContent = org.org2Name;
        select.appendChild(option);
    });
}

// 处理二级机构选择变更（模态框）
function handleModalParentLevel2Change() {
    // 更新机构代码前缀
    updateModalOrgCodePrefix();
}

// 更新机构代码前缀（模态框）
function updateModalOrgCodePrefix() {
    const selectedLevelElement = document.querySelector('#add-org-modal input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Value = document.getElementById('modal-parent-level1').value;
    const parentLevel2Value = document.getElementById('modal-parent-level2').value;
    const orgCodeInput = document.getElementById('modal-org-code');
    
    if (!orgCodeInput) return;
    
    // 根据选择的层级和父级机构更新代码前缀提示
    switch (selectedLevel) {
        case 1:
            orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 2:
            if (parentLevel1Value) {
                orgCodeInput.placeholder = `${parentLevel1Value} + 2位数字，例如：${parentLevel1Value}01`;
            } else {
                orgCodeInput.placeholder = '请先选择一级机构';
            }
            break;
        case 3:
            if (parentLevel2Value) {
                orgCodeInput.placeholder = `${parentLevel2Value} + 2位数字，例如：${parentLevel2Value}01`;
            } else if (parentLevel1Value) {
                orgCodeInput.placeholder = '请先选择二级机构';
            } else {
                orgCodeInput.placeholder = '请先选择一级机构';
            }
            break;
    }
}

// 处理机构代码输入（模态框）
function handleModalOrgCodeInput() {
    const orgCodeInput = document.getElementById('modal-org-code');
    if (!orgCodeInput) return;
    
    let value = orgCodeInput.value;
    
    // 自动转换为大写
    value = value.toUpperCase();
    
    // 移除非数字字符
    value = value.replace(/\D/g, '');
    
    // 限制长度
    const selectedLevelElement = document.querySelector('#add-org-modal input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    let maxLength = 2;
    
    switch (selectedLevel) {
        case 1:
            maxLength = 2;
            break;
        case 2:
            maxLength = 2;
            break;
        case 3:
            maxLength = 2;
            break;
    }
    
    if (value.length > maxLength) {
        value = value.substring(0, maxLength);
    }
    
    orgCodeInput.value = value;
}

// 提交新增机构表单（模态框）
async function handleSubmitAddOrg() {
    const selectedLevelElement = document.querySelector('#add-org-modal input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const orgName = document.getElementById('modal-org-name').value.trim();
    const orgCode = document.getElementById('modal-org-code').value.trim();
    const orgHead = document.getElementById('modal-org-head').value.trim();
    const orgDesc = document.getElementById('modal-org-desc').value.trim();
    const effectiveDate = document.getElementById('modal-effective-date').value;
    const parentLevel1Value = document.getElementById('modal-parent-level1').value;
    const parentLevel2Value = document.getElementById('modal-parent-level2').value;
    
    // 基本验证
    if (!orgName) {
        alert('请输入机构名称');
        return;
    }
    
    if (!orgCode) {
        alert('请输入机构代码');
        return;
    }
    
    // 根据机构层级进行额外验证
    let parentId = null;
    let fullOrgId = orgCode;
    
    switch (selectedLevel) {
        case 1:
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('一级机构代码必须为2位数字');
                return;
            }
            fullOrgId = orgCode;
            break;
        case 2:
            if (!parentLevel1Value) {
                alert('请选择一级机构');
                return;
            }
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('二级机构代码必须为2位数字');
                return;
            }
            fullOrgId = parentLevel1Value + orgCode;
            parentId = parentLevel1Value;
            break;
        case 3:
            if (!parentLevel1Value) {
                alert('请选择一级机构');
                return;
            }
            if (!parentLevel2Value) {
                alert('请选择二级机构');
                return;
            }
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('三级机构代码必须为2位数字');
                return;
            }
            fullOrgId = parentLevel2Value + orgCode;
            parentId = parentLevel2Value;
            break;
    }
    
    // 准备请求数据
    let requestData = {};
    let apiUrl = '';
    let successMessage = '';
    
    switch (selectedLevel) {
        case 1:
            requestData = {
                org1Id: fullOrgId,
                org1Name: orgName
            };
            apiUrl = '/api/admin/org/level1';
            successMessage = '一级机构创建成功';
            break;
        case 2:
            requestData = {
                org2Id: fullOrgId,
                org2Name: orgName,
                org1Id: parentId
            };
            apiUrl = '/api/admin/org/level2';
            successMessage = '二级机构创建成功';
            break;
        case 3:
            requestData = {
                org3Id: fullOrgId,
                org3Name: orgName,
                org2Id: parentId
            };
            apiUrl = '/api/admin/org/level3';
            successMessage = '三级机构创建成功';
            break;
    }
    
    // 发送请求
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(successMessage);
            closeAddOrgModal();
            // 重新加载组织数据
            loadOrgData();
            // 重新加载职位数据（因为职位下拉框需要更新）
            loadPositionsData();
        } else {
            alert('创建失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('创建机构失败:', error);
        alert('创建机构时发生错误，请稍后重试');
    }
}

// 打开新增机构模态框
function openAddOrgModal(level) {
    const modal = document.getElementById('add-org-modal');
    if (!modal) return;
    
    const orgLevelRadios = document.querySelectorAll('#add-org-modal input[name="orgLevel"]');
    
    // 设置默认选中的机构层级
    orgLevelRadios.forEach(radio => {
        if (parseInt(radio.value) === level) {
            radio.checked = true;
        }
    });
    
    // 触发层级变更事件以更新界面
    handleModalOrgLevelChange();
    
    // 清空表单
    const form = document.getElementById('add-org-form');
    if (form) form.reset();
    
    // 设置默认生效日期为今天
    const today = new Date().toISOString().split('T')[0];
    const effectiveDateInput = document.getElementById('modal-effective-date');
    if (effectiveDateInput) effectiveDateInput.value = today;
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 阻止背景滚动
}

// 关闭新增机构模态框
function closeAddOrgModal() {
    const modal = document.getElementById('add-org-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

// 打开新增用户模态框
function openAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (!modal) return;
    
    // 清空表单
    const form = document.getElementById('add-user-form');
    if (form) form.reset();
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 阻止背景滚动
}

// 关闭新增用户模态框
function closeAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

// 打开编辑用户模态框
function openEditUserModal(username, role, enabled) {
    const modal = document.getElementById('edit-user-modal');
    if (!modal) return;
    
    // 填充表单数据
    document.getElementById('edit-username').value = username;
    document.getElementById('edit-username-display').textContent = username;
    document.getElementById('edit-role').value = role;
    document.getElementById('edit-status').value = enabled.toString();
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 阻止背景滚动
}

// 关闭编辑用户模态框
function closeEditUserModal() {
    const modal = document.getElementById('edit-user-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

// 处理新增用户提交
async function handleAddUserSubmit() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;
    
    // 基本验证
    if (!username) {
        alert('请输入用户名');
        return;
    }
    
    if (!password) {
        alert('请输入密码');
        return;
    }
    
    if (!role) {
        alert('请选择角色');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password, role})
        });
        
        if (response.ok) {
            alert('用户创建成功');
            closeAddUserModal();
            loadUsersData(); // 重新加载用户列表
        } else {
            const result = await response.json();
            alert('创建失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('Create user error:', error);
        alert('创建用户时发生错误，请稍后重试');
    }
}

// 处理编辑用户提交
async function handleEditUserSubmit() {
    const username = document.getElementById('edit-username').value;
    const role = document.getElementById('edit-role').value;
    const enabled = document.getElementById('edit-status').value === 'true';
    
    try {
        const response = await fetch(`/api/users/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({role, enabled})
        });
        
        if (response.ok) {
            alert('用户更新成功');
            closeEditUserModal();
            loadUsersData(); // 重新加载用户列表
        } else {
            const result = await response.json();
            alert('更新失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('Update user error:', error);
        alert('更新用户时发生错误，请稍后重试');
    }
}

// 加载用户数据
async function loadUsersData() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const tbody = document.getElementById('users-body');
        if (tbody) {
            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.username}</td>
                    <td>${getUserRoleDisplayName(user.role)}</td>
                    <td>${user.enabled ? '启用' : '禁用'}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick="openEditUserModal('${user.username}', '${user.role}', ${user.enabled})">编辑</button>
                        <button class="btn-small btn-danger" onclick="deleteUser('${user.username}')">删除</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Load users data error:', error);
    }
}

// 获取角色显示名称
function getUserRoleDisplayName(role) {
    const roleMap = {
        'EMPLOYEE': '普通员工',
        'HR_SPEC': '人事专员',
        'HR_MANAGER': '人事经理',
        'ADMIN': '系统管理员'
    };
    return roleMap[role] || role;
}

// 删除用户
async function deleteUser(username) {
    if (username === 'admin') {
        alert('无法删除管理员账户');
        return;
    }
    
    if (confirm(`确定要删除用户 ${username} 吗？`)) {
        try {
            const response = await fetch(`/api/users/${username}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('用户删除成功');
                loadUsersData(); // 重新加载用户列表
            } else {
                const result = await response.json();
                alert('删除失败: ' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('Delete user error:', error);
            alert('删除用户时发生错误，请稍后重试');
        }
    }
}

// 切换查看/新增模式
function toggleViewMode() {
    isViewMode = !isViewMode;
    const toggleBtn = document.getElementById('toggle-view-btn');
    const formSection = document.getElementById('org-form-section');
    const listSection = document.getElementById('org-list-section');
    
    if (isViewMode) {
        // 切换到查看模式
        if (toggleBtn) toggleBtn.textContent = '新增机构';
        if (formSection) formSection.style.display = 'none';
        if (listSection) listSection.style.display = 'block';
        loadOrgListView(); // 加载机构列表
    } else {
        // 切换到新增/编辑模式
        if (toggleBtn) toggleBtn.textContent = '查看机构';
        if (formSection) formSection.style.display = 'block';
        if (listSection) listSection.style.display = 'none';
        resetOrgForm(); // 重置表单
    }
}

// 重置机构表单
function resetOrgForm() {
    const form = document.getElementById('org-form');
    if (form) form.reset();
    
    currentOrg = null;
    
    // 设置默认生效日期为今天
    const today = new Date().toISOString().split('T')[0];
    const effectiveDateInput = document.getElementById('effective-date');
    if (effectiveDateInput) effectiveDateInput.value = today;
    
    // 重置机构层级为一级机构
    const level1Radio = document.getElementById('level1');
    if (level1Radio) level1Radio.checked = true;
    
    // 触发层级变更事件
    handleOrgLevelChange();
}

// 处理机构层级变更
function handleOrgLevelChange() {
    const selectedLevelElement = document.querySelector('input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Group = document.getElementById('parent-level1-group');
    const parentLevel2Group = document.getElementById('parent-level2-group');
    const orgCodeInput = document.getElementById('org-code');
    
    // 清空机构代码输入框
    if (orgCodeInput) orgCodeInput.value = '';
    
    // 根据选择的层级显示相应的父级选择器
    switch (selectedLevel) {
        case 1:
            if (parentLevel1Group) parentLevel1Group.style.display = 'none';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none';
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 2:
            if (parentLevel1Group) parentLevel1Group.style.display = 'block';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none';
            populateParentLevel1Select();
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 3:
            if (parentLevel1Group) parentLevel1Group.style.display = 'block';
            if (parentLevel2Group) parentLevel2Group.style.display = 'none'; // 初始隐藏，选择一级后再显示
            populateParentLevel1Select();
            if (orgCodeInput) orgCodeInput.placeholder = '2位数字，例如：01';
            break;
    }
}

// 填充一级机构选择框
function populateParentLevel1Select() {
    const select = document.getElementById('parent-level1');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择一级机构</option>';
    
    orgData.level1.forEach(org => {
        const option = document.createElement('option');
        option.value = org.org1Id;
        option.textContent = org.org1Name;
        select.appendChild(option);
    });
}

// 处理一级机构选择变更
function handleParentLevel1Change() {
    const selectedLevelElement = document.querySelector('input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Value = document.getElementById('parent-level1').value;
    const parentLevel2Group = document.getElementById('parent-level2-group');
    const parentLevel2Select = document.getElementById('parent-level2');
    const orgCodeInput = document.getElementById('org-code');
    
    if (selectedLevel === 3 && parentLevel1Value) {
        if (parentLevel2Group) parentLevel2Group.style.display = 'block';
        populateParentLevel2Select(parentLevel1Value);
    } else {
        if (parentLevel2Group) parentLevel2Group.style.display = 'none';
        if (parentLevel2Select) {
            parentLevel2Select.innerHTML = '<option value="">请选择二级机构</option>';
        }
    }
    
    // 更新机构代码前缀
    updateOrgCodePrefix();
}

// 填充二级机构选择框
function populateParentLevel2Select(parentLevel1Id) {
    const select = document.getElementById('parent-level2');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择二级机构</option>';
    
    // 筛选出属于指定一级机构的二级机构
    const filteredOrgs = orgData.level2.filter(org => org.org1Id === parentLevel1Id);
    
    filteredOrgs.forEach(org => {
        const option = document.createElement('option');
        option.value = org.org2Id;
        option.textContent = org.org2Name;
        select.appendChild(option);
    });
}

// 处理二级机构选择变更
function handleParentLevel2Change() {
    // 更新机构代码前缀
    updateOrgCodePrefix();
}

// 更新机构代码前缀
function updateOrgCodePrefix() {
    const selectedLevelElement = document.querySelector('input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const parentLevel1Value = document.getElementById('parent-level1').value;
    const parentLevel2Value = document.getElementById('parent-level2').value;
    const orgCodeInput = document.getElementById('org-code');
    
    if (!orgCodeInput) return;
    
    // 根据选择的层级和父级机构更新代码前缀提示
    switch (selectedLevel) {
        case 1:
            orgCodeInput.placeholder = '2位数字，例如：01';
            break;
        case 2:
            if (parentLevel1Value) {
                orgCodeInput.placeholder = `${parentLevel1Value} + 2位数字，例如：${parentLevel1Value}01`;
            } else {
                orgCodeInput.placeholder = '请先选择一级机构';
            }
            break;
        case 3:
            if (parentLevel2Value) {
                orgCodeInput.placeholder = `${parentLevel2Value} + 2位数字，例如：${parentLevel2Value}01`;
            } else if (parentLevel1Value) {
                orgCodeInput.placeholder = '请先选择二级机构';
            } else {
                orgCodeInput.placeholder = '请先选择一级机构';
            }
            break;
    }
}

// 处理机构代码输入
function handleOrgCodeInput() {
    const orgCodeInput = document.getElementById('org-code');
    if (!orgCodeInput) return;
    
    let value = orgCodeInput.value;
    
    // 自动转换为大写
    value = value.toUpperCase();
    
    // 移除非数字字符
    value = value.replace(/\D/g, '');
    
    // 限制长度
    const selectedLevelElement = document.querySelector('input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    let maxLength = 2;
    
    switch (selectedLevel) {
        case 1:
            maxLength = 2;
            break;
        case 2:
            maxLength = 2;
            break;
        case 3:
            maxLength = 2;
            break;
    }
    
    if (value.length > maxLength) {
        value = value.substring(0, maxLength);
    }
    
    orgCodeInput.value = value;
}

// 保存机构
async function saveOrg() {
    const selectedLevelElement = document.querySelector('input[name="orgLevel"]:checked');
    if (!selectedLevelElement) return;
    
    const selectedLevel = parseInt(selectedLevelElement.value);
    const orgName = document.getElementById('org-name').value.trim();
    const orgCode = document.getElementById('org-code').value.trim();
    const orgHead = document.getElementById('org-head').value.trim();
    const orgDesc = document.getElementById('org-desc').value.trim();
    const effectiveDate = document.getElementById('effective-date').value;
    const parentLevel1Value = document.getElementById('parent-level1').value;
    const parentLevel2Value = document.getElementById('parent-level2').value;
    
    // 基本验证
    if (!orgName) {
        alert('请输入机构名称');
        return;
    }
    
    if (!orgCode) {
        alert('请输入机构代码');
        return;
    }
    
    // 根据机构层级进行额外验证
    let parentId = null;
    let fullOrgId = orgCode;
    
    switch (selectedLevel) {
        case 1:
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('一级机构代码必须为2位数字');
                return;
            }
            fullOrgId = orgCode;
            break;
        case 2:
            if (!parentLevel1Value) {
                alert('请选择一级机构');
                return;
            }
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('二级机构代码必须为2位数字');
                return;
            }
            fullOrgId = parentLevel1Value + orgCode;
            parentId = parentLevel1Value;
            break;
        case 3:
            if (!parentLevel1Value) {
                alert('请选择一级机构');
                return;
            }
            if (!parentLevel2Value) {
                alert('请选择二级机构');
                return;
            }
            if (orgCode.length !== 2 || !/^\d{2}$/.test(orgCode)) {
                alert('三级机构代码必须为2位数字');
                return;
            }
            fullOrgId = parentLevel2Value + orgCode;
            parentId = parentLevel2Value;
            break;
    }
    
    // 准备请求数据
    let requestData = {};
    let apiUrl = '';
    let method = 'POST';
    let successMessage = '';
    
    switch (selectedLevel) {
        case 1:
            requestData = {
                org1Id: fullOrgId,
                org1Name: orgName
            };
            apiUrl = '/api/admin/org/level1';
            successMessage = currentOrg ? '一级机构更新成功' : '一级机构创建成功';
            if (currentOrg) {
                method = 'PUT';
                apiUrl += '/' + currentOrg.org1Id;
            }
            break;
        case 2:
            requestData = {
                org2Id: fullOrgId,
                org2Name: orgName,
                org1Id: parentId
            };
            apiUrl = '/api/admin/org/level2';
            successMessage = currentOrg ? '二级机构更新成功' : '二级机构创建成功';
            if (currentOrg) {
                method = 'PUT';
                apiUrl += '/' + currentOrg.org2Id;
            }
            break;
        case 3:
            requestData = {
                org3Id: fullOrgId,
                org3Name: orgName,
                org2Id: parentId
            };
            apiUrl = '/api/admin/org/level3';
            successMessage = currentOrg ? '三级机构更新成功' : '三级机构创建成功';
            if (currentOrg) {
                method = 'PUT';
                apiUrl += '/' + currentOrg.org3Id;
            }
            break;
    }
    
    // 发送请求
    try {
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(successMessage);
            resetOrgForm(); // 重置表单
            // 重新加载组织数据
            loadOrgData();
            // 如果在查看模式下，刷新列表
            if (isViewMode) {
                loadOrgListView();
            }
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('保存机构失败:', error);
        alert('保存机构时发生错误，请稍后重试');
    }
}

// 编辑机构
function editOrg(level, org) {
    // 切换到编辑模式
    if (isViewMode) {
        toggleViewMode();
    }
    
    currentOrg = org;
    
    // 设置表单数据
    switch (level) {
        case 1:
            document.getElementById('level1').checked = true;
            document.getElementById('org-name').value = org.org1Name;
            document.getElementById('org-code').value = org.org1Id;
            break;
        case 2:
            document.getElementById('level2').checked = true;
            document.getElementById('org-name').value = org.org2Name;
            document.getElementById('org-code').value = org.org2Id.substring(2); // 去掉前缀
            document.getElementById('parent-level1').value = org.org1Id;
            break;
        case 3:
            document.getElementById('level3').checked = true;
            document.getElementById('org-name').value = org.org3Name;
            document.getElementById('org-code').value = org.org3Id.substring(4); // 去掉前缀
            document.getElementById('parent-level1').value = org.org1Id;
            // 触发一级机构变更以填充二级机构下拉框
            handleParentLevel1Change();
            // 稍微延迟设置二级机构，确保下拉框已填充
            setTimeout(() => {
                document.getElementById('parent-level2').value = org.org2Id;
            }, 100);
            break;
    }
    
    // 触发层级变更事件
    handleOrgLevelChange();
}

// 删除单个机构
async function deleteOrg(level, orgId, orgName) {
    if (!confirm(`确定要删除机构"${orgName}"吗？`)) {
        return;
    }
    
    let apiUrl = '';
    
    switch (level) {
        case 1:
            apiUrl = `/api/admin/org/level1/${orgId}`;
            break;
        case 2:
            apiUrl = `/api/admin/org/level2/${orgId}`;
            break;
        case 3:
            apiUrl = `/api/admin/org/level3/${orgId}`;
            break;
    }
    
    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('删除成功');
                // 重新加载组织数据
                loadOrgData();
                // 如果在查看模式下，刷新列表
                if (isViewMode) {
                    loadOrgListView();
                }
            } else {
                alert('删除失败: ' + (result.message || '未知错误'));
            }
        } else {
            const result = await response.json();
            alert('删除失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('删除机构失败:', error);
        alert('删除机构时发生错误，请稍后重试');
    }
}

// 全选/取消全选
function toggleSelectAll(level, checked) {
    const checkboxes = document.querySelectorAll(`input[name="org-checkbox-${level}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
}

// 加载机构列表视图
function loadOrgListView() {
    loadOrgLevel1List();
    loadOrgLevel2List();
    loadOrgLevel3List();
}

// 加载一级机构列表
function loadOrgLevel1List() {
    const tbody = document.getElementById('org-level1-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orgData.level1.forEach(org => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" name="org-checkbox-1" value="${org.org1Id}"></td>
            <td>${org.org1Id}</td>
            <td>${org.org1Name}</td>
            <td>
                <button class="btn-small btn-primary" onclick='editOrg(1, ${JSON.stringify(org).replace(/'/g, "\\'")})'>编辑</button>
                <button class="btn-small btn-danger" onclick='deleteOrg(1, "${org.org1Id}", "${org.org1Name}")'>删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 加载二级机构列表
function loadOrgLevel2List() {
    const tbody = document.getElementById('org-level2-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orgData.level2.forEach(org => {
        const parentOrg = orgData.level1.find(o => o.org1Id === org.org1Id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" name="org-checkbox-2" value="${org.org2Id}"></td>
            <td>${org.org2Id}</td>
            <td>${org.org2Name}</td>
            <td>${parentOrg ? parentOrg.org1Name : org.org1Id}</td>
            <td>
                <button class="btn-small btn-primary" onclick='editOrg(2, ${JSON.stringify(org).replace(/'/g, "\\'")})'>编辑</button>
                <button class="btn-small btn-danger" onclick='deleteOrg(2, "${org.org2Id}", "${org.org2Name}")'>删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 加载三级机构列表
function loadOrgLevel3List() {
    const tbody = document.getElementById('org-level3-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orgData.level3.forEach(org => {
        const parentOrg2 = orgData.level2.find(o => o.org2Id === org.org2Id);
        const parentOrg1 = parentOrg2 ? orgData.level1.find(o => o.org1Id === parentOrg2.org1Id) : null;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" name="org-checkbox-3" value="${org.org3Id}"></td>
            <td>${org.org3Id}</td>
            <td>${org.org3Name}</td>
            <td>${parentOrg1 ? parentOrg1.org1Name : ''} > ${parentOrg2 ? parentOrg2.org2Name : org.org2Id}</td>
            <td>
                <button class="btn-small btn-primary" onclick='editOrg(3, ${JSON.stringify(org).replace(/'/g, "\\'")})'>编辑</button>
                <button class="btn-small btn-danger" onclick='deleteOrg(3, "${org.org3Id}", "${org.org3Name}")'>删除</button>
            </td>
        `;
        tbody.appendChild(tr);
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
        const org1Count = document.getElementById('org1-count');
        const positionCount = document.getElementById('position-count');
        const userCount = document.getElementById('user-count');
        const roleCount = document.getElementById('role-count');
        
        if (org1Count) org1Count.textContent = '3';
        if (positionCount) positionCount.textContent = '15';
        if (userCount) userCount.textContent = '28';
        if (roleCount) roleCount.textContent = '4';
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
        const org1List = document.getElementById('org-level1-list');
        if (org1List) {
            org1List.innerHTML = '';
            orgData.level1.forEach(org => {
                const div = document.createElement('div');
                div.className = 'org-item';
                div.innerHTML = `
                    <span class="org-name">${org.org1Name}</span>
                    <span class="org-id">(${org.org1Id})</span>
                `;
                org1List.appendChild(div);
            });
        }
        
        // 加载二级机构
        const org2Response = await fetch('/api/admin/org/level2');
        const org2Data = await org2Response.json();
        orgData.level2 = org2Data.data || [];
        const org2List = document.getElementById('org-level2-list');
        if (org2List) {
            org2List.innerHTML = '';
            orgData.level2.forEach(org => {
                const parentOrg = orgData.level1.find(o => o.org1Id === org.org1Id);
                const div = document.createElement('div');
                div.className = 'org-item';
                div.innerHTML = `
                    <span class="org-name">${org.org2Name}</span>
                    <span class="org-id">(${org.org2Id})</span>
                    <span class="org-parent">${parentOrg ? parentOrg.org1Name : org.org1Id}</span>
                `;
                org2List.appendChild(div);
            });
        }
        
        // 加载三级机构
        const org3Response = await fetch('/api/admin/org/level3');
        const org3Data = await org3Response.json();
        orgData.level3 = org3Data.data || [];
        const org3List = document.getElementById('org-level3-list');
        if (org3List) {
            org3List.innerHTML = '';
            orgData.level3.forEach(org => {
                const parentOrg = orgData.level2.find(o => o.org2Id === org.org2Id);
                const div = document.createElement('div');
                div.className = 'org-item';
                div.innerHTML = `
                    <span class="org-name">${org.org3Name}</span>
                    <span class="org-id">(${org.org3Id})</span>
                    <span class="org-parent">${parentOrg ? parentOrg.org2Name : org.org2Id}</span>
                `;
                org3List.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Load organization data error:', error);
    }
}

// 加载职位数据
async function loadPositionsData() {
    try {
        const response = await fetch('/api/admin/positions');
        const result = await response.json();
        const positions = result.data || [];
        
        const tbody = document.getElementById('positions-body');
        if (tbody) {
            tbody.innerHTML = '';
            positions.forEach(position => {
                // 查找对应的三级机构
                const level3Org = orgData.level3.find(org => org.org3Id === position.org3Id);
                // 查找对应的二级机构
                const level2Org = level3Org ? orgData.level2.find(org => org.org2Id === level3Org.org2Id) : null;
                // 查找对应的一级机构
                const level1Org = level2Org ? orgData.level1.find(org => org.org1Id === level2Org.org1Id) : null;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${position.positionId}</td>
                    <td>${position.positionName}</td>
                    <td>${level1Org ? level1Org.org1Name : ''} > 
                        ${level2Org ? level2Org.org2Name : ''} > 
                        ${level3Org ? level3Org.org3Name : ''}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick='editPosition(${JSON.stringify(position).replace(/'/g, "\\'")})'>编辑</button>
                        <button class="btn-small btn-danger" onclick='deletePosition("${position.positionId}")'>删除</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Load positions data error:', error);
    }
}

// 编辑职位
function editPosition(position) {
    // 这里可以打开一个编辑模态框，允许修改职位名称和所属机构
    alert(`编辑职位: ${position.positionName}\n职位ID: ${position.positionId}`);
    // 实际实现中，应该打开编辑模态框并预填数据
}

// 删除职位
async function deletePosition(positionId) {
    if (!confirm('确定要删除这个职位吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/positions/${positionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('删除成功');
                loadPositionsData(); // 重新加载职位列表
            } else {
                alert('删除失败: ' + (result.message || '未知错误'));
            }
        } else {
            const result = await response.json();
            alert('删除失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('删除职位失败:', error);
        alert('删除职位时发生错误，请稍后重试');
    }
}

// 打开新增职位模态框
function openAddPositionModal() {
    const modal = document.getElementById('add-position-modal');
    if (!modal) return;
    
    // 清空表单
    const form = document.getElementById('add-position-form');
    if (form) form.reset();
    
    // 填充三级机构下拉框
    populatePositionOrg3Select();
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 阻止背景滚动
}

// 填充职位三级机构选择框
function populatePositionOrg3Select() {
    const select = document.getElementById('position-org3');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择三级机构</option>';
    
    orgData.level3.forEach(org => {
        // 查找对应的二级机构
        const level2Org = orgData.level2.find(o => o.org2Id === org.org2Id);
        // 查找对应的一级机构
        const level1Org = level2Org ? orgData.level1.find(o => o.org1Id === level2Org.org1Id) : null;
        
        const option = document.createElement('option');
        option.value = org.org3Id;
        option.textContent = `${level1Org ? level1Org.org1Name : ''} > ${level2Org ? level2Org.org2Name : ''} > ${org.org3Name}`;
        select.appendChild(option);
    });
}

// 关闭新增职位模态框
function closeAddPositionModal() {
    const modal = document.getElementById('add-position-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
}

// 处理新增职位提交
async function handleAddPositionSubmit() {
    const positionName = document.getElementById('position-name').value.trim();
    const org3Id = document.getElementById('position-org3').value;
    
    // 基本验证
    if (!positionName) {
        alert('请输入职位名称');
        return;
    }
    
    if (!org3Id) {
        alert('请选择三级机构');
        return;
    }
    
    // 生成职位ID (使用机构ID + 3位数字序号)
    const positionId = org3Id + '001'; // 简化处理，实际应查询数据库获取最大序号
    
    try {
        const response = await fetch('/api/admin/positions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                positionId: positionId,
                positionName: positionName,
                org3Id: org3Id
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('职位创建成功');
            closeAddPositionModal();
            loadPositionsData(); // 重新加载职位列表
        } else {
            alert('创建失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('创建职位失败:', error);
        alert('创建职位时发生错误，请稍后重试');
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
                case 'org':
                    currentPageTitle.textContent = '组织架构管理';
                    // 重置到新增模式
                    isViewMode = false;
                    const toggleBtn = document.getElementById('toggle-view-btn');
                    const formSection = document.getElementById('org-form-section');
                    const listSection = document.getElementById('org-list-section');
                    if (toggleBtn) toggleBtn.textContent = '查看机构';
                    if (formSection) formSection.style.display = 'block';
                    if (listSection) listSection.style.display = 'none';
                    resetOrgForm();
                    break;
                case 'positions':
                    currentPageTitle.textContent = '关联职位';
                    break;
                case 'users':
                    currentPageTitle.textContent = '用户管理';
                    // 加载用户数据
                    loadUsersData();
                    break;
                case 'attendance-rules':
                    currentPageTitle.textContent = '考勤规则管理';
                    break;
                default:
                    currentPageTitle.textContent = '系统管理';
            }
        }
        
        // 如果是职位管理面板，加载职位数据
        if (paneId === 'positions') {
            loadPositionsData();
        }
        
        // 如果是组织架构面板，加载组织数据
        if (paneId === 'org') {
            loadOrgData();
        }
        
        // 如果是用户管理面板，加载用户数据
        if (paneId === 'users') {
            loadUsersData();
        }
    }
}
