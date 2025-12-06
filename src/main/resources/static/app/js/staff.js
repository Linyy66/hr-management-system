// 创建员工档案
function staffCreate() {
    const staffData = {
        archiveId: document.getElementById('staff-archiveId').value,
        org1Id: document.getElementById('staff-org1Id').value,
        org2Id: document.getElementById('staff-org2Id').value,
        org3Id: document.getElementById('staff-org3Id').value,
        positionId: document.getElementById('staff-positionId').value,
        staffName: document.getElementById('staff-name').value,
        mobile: document.getElementById('staff-mobile').value,
        createBy: localStorage.getItem('hrms_user')
    };

    fetch('/api/staff', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(staffData)
    }).then(res => {
        if (res.ok) {
            alert('档案创建成功');
            staffRefresh();
        } else {
            alert('档案创建失败');
        }
    });
}

// 刷新员工列表
function staffRefresh() {
    fetch('/api/staff', {
        headers: getAuthHeader()
    }).then(res => res.json()).then(data => {
        const tbody = document.getElementById('staff-table-body');
        tbody.innerHTML = '';
        data.forEach(staff => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${staff.archiveId}</td>
                <td>${staff.staffName}</td>
                <td>${staff.org1Id}-${staff.org2Id}-${staff.org3Id}</td>
                <td>${staff.mobile}</td>
                <td>${staff.status === 'PENDING' ? '待审核' : '正常'}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}