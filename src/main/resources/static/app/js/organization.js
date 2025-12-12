// 初始化机构页面
function initOrgPage() {
    loadOrgLevel1List();
}

// 加载一级机构列表
function loadOrgLevel1List() {
    apiRequest('/api/organizations/level1')
        .then(data => {
            if (!data) return;
            const listEl = document.getElementById('org1-list');
            const selectEl = document.getElementById('parent-org1');
            listEl.innerHTML = '';
            selectEl.innerHTML = '<option value="">选择一级机构</option>';
            data.forEach(org => {
                listEl.innerHTML += `<div class="org-item">${org.org1Id} - ${org.org1Name}</div>`;
                selectEl.innerHTML += `<option value="${org.org1Id}">${org.org1Name}</option>`;
            });
        });
}

// 添加一级机构
function addOrgLevel1() {
    const org = {
        org1Id: document.getElementById('org1-id').value,
        org1Name: document.getElementById('org1-name').value
    };
    if (!org.org1Id || !org.org1Name) {
        alert('ID和名称不能为空');
        return;
    }
    apiRequest('/api/organizations/level1', 'POST', org)
        .then(() => {
            alert('一级机构添加成功');
            loadOrgLevel1List();
            document.getElementById('org1-id').value = '';
            document.getElementById('org1-name').value = '';
        });
}

// 加载二级机构（根据一级机构）
function loadOrgLevel2() {
    const org1Id = document.getElementById('parent-org1').value;
    if (!org1Id) return;
    apiRequest(`/api/organizations/level2/${org1Id}`)
        .then(data => {
            if (!data) return;
            const listEl = document.getElementById('org2-list');
            const selectEl = document.getElementById('parent-org2');
            listEl.innerHTML = '';
            selectEl.innerHTML = '<option value="">选择二级机构</option>';
            data.forEach(org => {
                listEl.innerHTML += `<div class="org-item">${org.org2Id} - ${org.org2Name}</div>`;
                selectEl.innerHTML += `<option value="${org.org2Id}">${org.org2Name}</option>`;
            });
        });
}

// 添加二级机构
function addOrgLevel2() {
    const org = {
        org2Id: document.getElementById('org2-id').value,
        org1Id: document.getElementById('parent-org1').value,
        org2Name: document.getElementById('org2-name').value
    };
    if (!org.org2Id || !org.org1Id || !org.org2Name) {
        alert('请填写完整信息');
        return;
    }
    apiRequest('/api/organizations/level2', 'POST', org)
        .then(() => {
            alert('二级机构添加成功');
            loadOrgLevel2();
            document.getElementById('org2-id').value = '';
            document.getElementById('org2-name').value = '';
        });
}

// 加载三级机构（根据二级机构）
function loadOrgLevel3() {
    const org2Id = document.getElementById('parent-org2').value;
    if (!org2Id) return;
    apiRequest(`/api/organizations/level3/${org2Id}`)
        .then(data => {
            if (!data) return;
            const listEl = document.getElementById('org3-list');
            listEl.innerHTML = '';
            data.forEach(org => {
                listEl.innerHTML += `<div class="org-item">${org.org3Id} - ${org.org3Name}</div>`;
            });
        });
}

// 添加三级机构
function addOrgLevel3() {
    const org = {
        org3Id: document.getElementById('org3-id').value,
        org2Id: document.getElementById('parent-org2').value,
        org3Name: document.getElementById('org3-name').value
    };
    if (!org.org3Id || !org.org2Id || !org.org3Name) {
        alert('请填写完整信息');
        return;
    }
    apiRequest('/api/organizations/level3', 'POST', org)
        .then(() => {
            alert('三级机构添加成功');
            loadOrgLevel3();
            document.getElementById('org3-id').value = '';
            document.getElementById('org3-name').value = '';
        });
}

// 加载所有三级机构（用于职位设置）
function loadAllOrg3() {
    apiRequest('/api/organizations/level3/all')
        .then(data => {
            if (!data) return;
            const selects = [
                document.getElementById('position-org3'),
                document.getElementById('edit-org3-select')
            ];
            selects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">选择三级机构</option>';
                    data.forEach(org => {
                        select.innerHTML += `<option value="${org.org3Id}">${org.org3Name}</option>`;
                    });
                }
            });
        });
}

// 加载三级机构详情（用于修改）
function loadOrg3Detail() {
    const org3Id = document.getElementById('edit-org3-select').value;
    if (!org3Id) return;
    apiRequest(`/api/organizations/level3/${org3Id}`)
        .then(data => {
            if (data) {
                document.getElementById('edit-org3-name').value = data.org3Name;
            }
        });
}

// 修改三级机构
function updateOrg3() {
    const org3Id = document.getElementById('edit-org3-select').value;
    const newName = document.getElementById('edit-org3-name').value;
    if (!org3Id || !newName) {
        alert('请选择机构并输入新名称');
        return;
    }
    apiRequest(`/api/organizations/level3/${org3Id}`, 'PUT', { org3Name: newName })
        .then(() => alert('三级机构修改成功'));
}