// 全局变量
const baseUrl = '/hr/api'; // 接口前缀
let currentPage = 1; // 当前页码
let totalPage = 0; // 总页数
let totalCount = 0; // 总记录数
const pageSize = 10; // 每页条数

// DOM元素
const empTableBody = document.getElementById('empTableBody');
const searchName = document.getElementById('searchName');
const searchDept = document.getElementById('searchDept');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const addBtn = document.getElementById('addBtn');
const empModal = document.getElementById('empModal');
const modalTitle = document.getElementById('modalTitle');
const empForm = document.getElementById('empForm');
const empId = document.getElementById('empId');
const empName = document.getElementById('empName');
const empGender = document.getElementById('empGender');
const empIdCard = document.getElementById('empIdCard');
const empMobile = document.getElementById('empMobile');
const empEmail = document.getElementById('empEmail');
const empDept = document.getElementById('empDept');
const empJob = document.getElementById('empJob');
const empEducation = document.getElementById('empEducation');
const empHireDate = document.getElementById('empHireDate');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

// 页面加载完成后初始化
window.onload = function() {
    // 加载部门列表用于查询和表单选择
    loadDepartments();
    // 加载员工列表默认第一页
    loadEmployeeList();
    // 绑定事件
    bindEvents();
};

// 加载部门列表
function loadDepartments() {
    axios.get(`${baseUrl}/departments`)
        .then(res => {
            if (res.data.code === 200) {
                const departments = res.data.data;
                let optionHtml = '<option value="">全部部门</option>';
                let formOptionHtml = '<option value="">请选择部门</option>';

                departments.forEach(dept => {
                    optionHtml += `<option value="${dept.id}">${dept.name}</option>`;
                    formOptionHtml += `<option value="${dept.id}">${dept.name}</option>`;
                });

                // 更新查询表单和新增/编辑表单的部门下拉框
                searchDept.innerHTML = optionHtml;
                empDept.innerHTML = formOptionHtml;

                // 部门变更时加载岗位
                empDept.addEventListener('change', function() {
                    const deptId = this.value;
                    if (deptId) {
                        loadJobsByDeptId(deptId);
                    } else {
                        empJob.innerHTML = '<option value="">请先选择部门</option>';
                    }
                });
            } else {
                alert('加载部门失败: ' + (res.data.msg || '未知错误'));
            }
        })
        .catch(err => {
            console.error('加载部门出错:', err);
            alert('网络异常，加载部门失败');
        });
}

// 根据部门ID加载岗位
function loadJobsByDeptId(deptId) {
    axios.get(`${baseUrl}/jobs`, { params: { deptId } })
        .then(res => {
            if (res.data.code === 200) {
                const jobs = res.data.data;
                let optionHtml = '<option value="">请选择岗位</option>';

                jobs.forEach(job => {
                    optionHtml += `<option value="${job.id}">${job.name}</option>`;
                });

                empJob.innerHTML = optionHtml;
            } else {
                alert('加载岗位失败: ' + (res.data.msg || '未知错误'));
            }
        })
        .catch(err => {
            console.error('加载岗位出错:', err);
            alert('网络异常，加载岗位失败');
        });
}

// 加载员工列表
function loadEmployeeList() {
    // 构建查询参数
    const params = {
        pageNum: currentPage,
        pageSize: pageSize,
        name: searchName.value.trim(),
        deptId: searchDept.value
    };

    axios.get(`${baseUrl}/employees/page`, { params })
        .then(res => {
            if (res.data.code === 200) {
                const data = res.data.data;
                const employees = data.records || [];
                totalCount = data.total || 0;
                totalPage = Math.ceil(totalCount / pageSize);

                // 渲染员工表格
                renderEmployeeTable(employees);
                // 更新分页信息
                updatePagination();
            } else {
                alert('加载员工列表失败: ' + (res.data.msg || '未知错误'));
            }
        })
        .catch(err => {
            console.error('加载员工列表出错:', err);
            alert('网络异常，加载员工列表失败');
        });
}

// 渲染员工表格
function renderEmployeeTable(employees) {
    empTableBody.innerHTML = ''; // 清空表格

    if (employees.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" style="padding: 20px;">暂无数据</td>`;
        empTableBody.appendChild(tr);
        return;
    }

    // 遍历员工数据生成表格行
    employees.forEach(emp => {
        const tr = document.createElement('tr');
        // 性别格式化：1=男，2=女
        const gender = emp.gender === '1' ? '男' : '女';
        // 部门名称
        const deptName = getDeptNameById(emp.deptId);
        // 岗位名称
        const jobName = getJobNameById(emp.jobId);

        tr.innerHTML = `
            <td>${emp.empNo || ''}</td>
            <td>${emp.name || ''}</td>
            <td>${gender}</td>
            <td>${emp.mobile || ''}</td>
            <td>${deptName}</td>
            <td>${jobName}</td>
            <td>${emp.hireDate ? formatDate(emp.hireDate) : ''}</td>
            <td>
                <button class="btn default edit-btn" data-id="${emp.id}">编辑</button>
                <button class="btn default delete-btn" data-id="${emp.id}">删除</button>
            </td>
        `;

        empTableBody.appendChild(tr);
    });

    // 绑定表格按钮事件
    bindTableBtnEvents();
}

// 日期格式化
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 根据部门ID获取部门名称
function getDeptNameById(deptId) {
    const options = searchDept.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == deptId) {
            return options[i].text;
        }
    }
    return '未知部门';
}

// 根据岗位ID获取岗位名称
function getJobNameById(jobId) {
    const options = empJob.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value == jobId) {
            return options[i].text;
        }
    }
    return '未知岗位';
}

// 更新分页信息
function updatePagination() {
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPage || 0} 页`;
    // 禁用/启用分页按钮
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage >= totalPage;
}

// 绑定页面事件
function bindEvents() {
    // 查询按钮事件
    searchBtn.addEventListener('click', function() {
        currentPage = 1; // 重置为第一页
        loadEmployeeList();
    });

    // 重置按钮事件
    resetBtn.addEventListener('click', function() {
        searchName.value = '';
        searchDept.value = '';
        currentPage = 1;
        loadEmployeeList();
    });

    // 上一页事件
    prevPage.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadEmployeeList();
        }
    });

    // 下一页事件
    nextPage.addEventListener('click', function() {
        if (currentPage < totalPage) {
            currentPage++;
            loadEmployeeList();
        }
    });

    // 添加按钮事件
    addBtn.addEventListener('click', function() {
        modalTitle.textContent = '添加员工';
        empForm.reset(); // 重置表单
        empId.value = ''; // 清空员工ID
        empHireDate.value = new Date().toISOString().split('T')[0]; // 默认当前日期
        empModal.style.display = 'flex'; // 显示弹窗
    });

    // 关闭按钮事件
    closeBtn.addEventListener('click', function() {
        empModal.style.display = 'none';
    });

    // 取消按钮事件
    cancelBtn.addEventListener('click', function() {
        empModal.style.display = 'none';
    });

    // 点击弹窗外部关闭
    empModal.addEventListener('click', function(e) {
        if (e.target === empModal) {
            empModal.style.display = 'none';
        }
    });

    // 表单提交事件
    empForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交
        submitForm();
    });
}

// 绑定表格编辑/删除按钮事件
function bindTableBtnEvents() {
    // 编辑按钮事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editEmployee(id);
        });
    });

    // 删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('确定要删除该员工吗？')) {
                deleteEmployee(id);
            }
        });
    });
}

// 编辑员工
function editEmployee(id) {
    axios.get(`${baseUrl}/employees/${id}`)
        .then(res => {
            if (res.data.code === 200) {
                const emp = res.data.data;
                modalTitle.textContent = '编辑员工';

                // 填充表单数据
                empId.value = emp.id;
                empName.value = emp.name || '';
                empGender.value = emp.gender || '1';
                empIdCard.value = emp.idCard || '';
                empMobile.value = emp.mobile || '';
                empEmail.value = emp.email || '';
                empDept.value = emp.deptId || '';
                empEducation.value = emp.education || '本科';
                empHireDate.value = emp.hireDate ? emp.hireDate.split('T')[0] : '';

                // 加载对应部门的岗位
                if (emp.deptId) {
                    loadJobsByDeptId(emp.deptId).then(() => {
                        empJob.value = emp.jobId || '';
                    });
                }

                empModal.style.display = 'flex';
            } else {
                alert('获取员工信息失败: ' + (res.data.msg || '未知错误'));
            }
        })
        .catch(err => {
            console.error('编辑员工出错:', err);
            alert('网络异常，获取员工信息失败');
        });
}

// 删除员工
function deleteEmployee(id) {
    axios.delete(`${baseUrl}/employees/${id}`)
        .then(res => {
            if (res.data.code === 200) {
                alert('删除成功');
                loadEmployeeList(); // 重新加载列表
            } else {
                alert('删除失败: ' + (res.data.msg || '未知错误'));
            }
        })
        .catch(err => {
            console.error('删除员工出错:', err);
            alert('网络异常，删除失败');
        });
}

// 提交表单(新增或编辑)
function submitForm() {
    const data = {
        name: empName.value.trim(),
        gender: empGender.value,
        idCard: empIdCard.value.trim(),
        mobile: empMobile.value.trim(),
        email: empEmail.value.trim(),
        deptId: empDept.value,
        jobId: empJob.value,
        education: empEducation.value,
        hireDate: empHireDate.value
    };

    // 编辑操作
    if (empId.value) {
        axios.put(`${baseUrl}/employees/${empId.value}`, data)
            .then(handleSubmitResponse)
            .catch(handleSubmitError);
    }
    // 新增操作
    else {
        axios.post(`${baseUrl}/employees`, data)
            .then(handleSubmitResponse)
            .catch(handleSubmitError);
    }
}

// 处理提交响应
function handleSubmitResponse(res) {
    if (res.data.code === 200) {
        alert('操作成功');
        empModal.style.display = 'none';
        loadEmployeeList(); // 重新加载列表
    } else {
        alert('操作失败: ' + (res.data.msg || '未知错误'));
    }
}

// 处理提交错误
function handleSubmitError(err) {
    console.error('提交表单出错:', err);
    alert('网络异常，操作失败');
}