// 添加一级机构
function org1Add() {
    const orgData = {
        org1Id: document.getElementById('org1-id').value,
        org1Name: document.getElementById('org1-name').value,
        createBy: localStorage.getItem('hrms_user')
    };

    fetch('/api/org1', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(orgData)
    }).then(res => {
        if (res.ok) {
            alert('一级机构添加成功');
            org1Refresh();
        } else {
            alert('机构添加失败');
        }
    });
}

// 刷新一级机构列表
function org1Refresh() {
    fetch('/api/org1', {
        headers: getAuthHeader()
    }).then(res => res.json()).then(data => {
        const listEl = document.getElementById('org1-list');
        listEl.innerHTML = '';
        data.forEach(org => {
            const div = document.createElement('div');
            div.className = 'org-item';
            div.textContent = `${org.org1Id} - ${org.org1Name}`;
            listEl.appendChild(div);
        });
    });
}