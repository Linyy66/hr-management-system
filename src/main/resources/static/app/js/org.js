// 页面加载时初始化
window.onload = function() {
    if (isAdmin()) { // 仅管理员显示一级/二级机构管理
        loadOrg1Options();
        org1Refresh();
    }
    loadOrg2Options(); // 所有人可查看二级机构列表
};

// 加载一级机构到下拉框
function loadOrg1Options() {
    fetch('/api/org/level1', {headers: getAuthHeader()})
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('parent-org1');
            data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org1Id;
                option.textContent = org.org1Name;
                select.appendChild(option);
            });
        });
}

// 二级机构添加
function org2Add() {
    const orgData = {
        org2Id: document.getElementById('org2-id').value,
        org1Id: document.getElementById('parent-org1').value,
        org2Name: document.getElementById('org2-name').value
    };

    fetch('/api/org/level2', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(orgData)
    }).then(res => {
        if (res.ok) {
            alert('二级机构添加成功');
            loadOrg2ByOrg1();
        } else {
            alert('添加失败：请检查一级机构是否存在');
        }
    });
}

// 三级机构添加
function org3Add() {
    const orgData = {
        org3Id: document.getElementById('org3-id').value,
        org2Id: document.getElementById('parent-org2').value,
        org3Name: document.getElementById('org3-name').value
    };

    fetch('/api/org/level3', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(orgData)
    }).then(res => {
        if (res.ok) {
            alert('三级机构添加成功');
            loadOrg3ByOrg2();
        } else {
            alert('添加失败：请检查二级机构是否存在');
        }
    });
}

// 根据一级机构加载二级机构
function loadOrg2ByOrg1() {
    const org1Id = document.getElementById('parent-org1').value;
    if (!org1Id) return;

    fetch(`/api/org/level2/${org1Id}`, {headers: getAuthHeader()})
        .then(res => res.json())
        .then(data => {
            const listEl = document.getElementById('org2-list');
            listEl.innerHTML = '';
            data.forEach(org => {
                const div = document.createElement('div');
                div.className = 'org-item';
                div.textContent = `${org.org2Id} - ${org.org2Name}`;
                listEl.appendChild(div);
            });
            // 同步更新二级机构下拉框
            const select = document.getElementById('parent-org2');
            select.innerHTML = '<option value="">选择二级机构</option>';
            data.forEach(org => {
                const option = document.createElement('option');
                option.value = org.org2Id;
                option.textContent = org.org2Name;
                select.appendChild(option);
            });
        });
}

// 根据二级机构加载三级机构
function loadOrg3ByOrg2() {
    const org2Id = document.getElementById('parent-org2').value;
    if (!org2Id) return;

    fetch(`/api/org/level3/${org2Id}`, {headers: getAuthHeader()})
        .then(res => res.json())
        .then(data => {
            const listEl = document.getElementById('org3-list');
            listEl.innerHTML = '';
            data.forEach(org => {
                const div = document.createElement('div');
                div.className = 'org-item';
                div.textContent = `${org.org3Id} - ${org.org3Name}`;
                listEl.appendChild(div);
            });
        });
}