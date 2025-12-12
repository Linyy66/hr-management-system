// 初始化员工表单（机构级联选择）
function initStaffForm() {
    // 加载一级机构
    apiRequest('/api/organizations/level1')
        .then(data => {
            if (!data) return;
            const org1Select = document.getElementById('staff-org1Id');
            data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org1Id;
                option.textContent = org.org1Name;
                org1Select.appendChild(option);
            });
        });

    // 一级机构变更时加载二级机构
    document.getElementById('staff-org1Id').addEventListener('change', function() {
        const org1Id = this.value;
        const org2Select = document.getElementById('staff-org2Id');
        org2Select.innerHTML = '<option value="">选择二级机构</option>';
        if (!org1Id) return;

        apiRequest(`/api/organizations/level2/${org1Id}`)
            .then(data => {
                if (!data) return;
                data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.org2Id;
                    option.textContent = org.org2Name;
                    org2Select.appendChild(option);
                });
            });
    });

    // 二级机构变更时加载三级机构
    document.getElementById('staff-org2Id').addEventListener('change', function() {
        const org2Id = this.value;
        const org3Select = document.getElementById('staff-org3Id');
        org3Select.innerHTML = '<option value="">选择三级机构</option>';
        if (!org2Id) return;

        apiRequest(`/api/organizations/level3/${org2Id}`)
            .then(data => {
                if (!data) return;
                data.forEach(org => {
                    const option = document.createElement('option');
                    option.value = org.org3Id;
                    option.textContent = org.org3Name;
                    org3Select.appendChild(option);
                });
            });
    });
}

// 员工审批相关
function initStaffApprove() {
    loadStaffOrg1(); // 初始化一级机构下拉框
}

// 加载一级机构（审批页面）
function loadStaffOrg1() {
    apiRequest('/api/organizations/level1')
        .then(data => {
            if (!data) return;
            const selectEl = document.getElementById('staff-org1');
            selectEl.innerHTML = '<option value="">选择一级机构</option>';
            data.forEach(org => {
                selectEl.innerHTML += `<option value="${org.org1Id}">${org.org1Name}</option>`;
            });
        });
}

// 加载二级机构（审批页面）
function loadStaffOrg2() {
    const org1Id = document.getElementById('staff-org1').value;
    if (!org1Id) {
        document.getElementById('staff-org2').innerHTML = '<option value="">选择二级机构</option>';
        return;
    }
    apiRequest(`/api/organizations/level2/${org1Id}`)
        .then(data => {
            if (!data) return;
            const selectEl = document.getElementById('staff-org2');
            selectEl.innerHTML = '<option value="">选择二级机构</option>';
            data.forEach(org => {
                selectEl.innerHTML += `<option value="${org.org2Id}">${org.org2Name}</option>`;
            });
        });
}

// 加载三级机构（审批页面）
function loadStaffOrg3() {
    const org2Id = document.getElementById('staff-org2').value;
    if (!org2Id) {
        document.getElementById('staff-org3').innerHTML = '<option value="">选择三级机构</option>';
        return;
    }
    apiRequest(`/api/organizations/level3/${org2Id}`)
        .then(data => {
            if (!data) return;
            const selectEl = document.getElementById('staff-org3');
            selectEl.innerHTML = '<option value="">选择三级机构</option>';
            data.forEach(org => {
                selectEl.innerHTML += `<option value="${org.org3Id}">${org.org3Name}</option>`;
            });
        });
}

// 加载职位（审批页面）
function loadStaffPositions() {
    const org3Id = document.getElementById('staff-org3').value;
    if (!org3Id) {
        document.getElementById('staff-position').innerHTML = '<option value="">选择职位</option>';
        return;
    }
    apiRequest(`/api/positions/org3/${org3Id}`)
        .then(data => {
            if (!data) return;
            const selectEl = document.getElementById('staff-position');
            selectEl.innerHTML = '<option value="">选择职位</option>';
            data.forEach(pos => {
                selectEl.innerHTML += `<option value="${pos.positionId}">${pos.positionName}</option>`;
            });
        });
}

// 审批员工
function approveStaff() {
    const staff = {
        name: document.getElementById('staff-name').value,
        org1Id: document.getElementById('staff-org1').value,
        org2Id: document.getElementById('staff-org2').value,
        org3Id: document.getElementById('staff-org3').value,
        positionId: document.getElementById('staff-position').value
    };
    if (!staff.name || !staff.org3Id || !staff.positionId) {
        alert('请填写员工姓名并选择完整机构和职位');
        return;
    }
    apiRequest('/api/staff/approve', 'POST', staff)
        .then(() => alert('员工审批成功'));
}