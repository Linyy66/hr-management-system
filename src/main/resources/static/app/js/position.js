// 初始化职位页面
function initPositionPage() {
    loadAllOrg3(); // 加载三级机构到下拉框
}

// 加载职位列表（根据三级机构）
function loadPositions() {
    const org3Id = document.getElementById('position-org3').value;
    if (!org3Id) {
        document.getElementById('position-list').innerHTML = '';
        return;
    }
    apiRequest(`/api/positions/org3/${org3Id}`)
        .then(data => {
            if (!data) return;
            const listEl = document.getElementById('position-list');
            listEl.innerHTML = '';
            data.forEach(pos => {
                listEl.innerHTML += `<div class="org-item">${pos.positionId} - ${pos.positionName}</div>`;
            });
        });
}

// 添加职位
function addPosition() {
    const position = {
        positionId: document.getElementById('position-id').value,
        org3Id: document.getElementById('position-org3').value,
        positionName: document.getElementById('position-name').value
    };
    if (!position.positionId || !position.org3Id || !position.positionName) {
        alert('请填写完整信息');
        return;
    }
    apiRequest('/api/positions', 'POST', position)
        .then(() => {
            alert('职位添加成功');
            loadPositions();
            document.getElementById('position-id').value = '';
            document.getElementById('position-name').value = '';
        });
}