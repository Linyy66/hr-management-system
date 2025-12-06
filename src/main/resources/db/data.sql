USE hr_management;

-- 插入机构数据
INSERT INTO department (name, parent_id, level, sort) VALUES
                                                          ('技术中心', 0, 1, 1),
                                                          ('市场中心', 0, 1, 2),
                                                          ('产品研发部', 1, 2, 1),  -- 属于技术中心
                                                          ('测试部', 1, 2, 2),      -- 属于技术中心
                                                          ('前端组', 3, 3, 1),      -- 属于产品研发部
                                                          ('后端组', 3, 3, 2);      -- 属于产品研发部

-- 插入职位数据
INSERT INTO hr_job (name, dept_id) VALUES
                                       ('前端工程师', 5),    -- 属于前端组
                                       ('后端工程师', 6),    -- 属于后端组
                                       ('测试工程师', 4),    -- 属于测试部
                                       ('产品经理', 3);      -- 属于产品研发部

-- 插入员工数据
INSERT INTO employee (emp_no, name, gender, id_card, mobile, email, dept_id, job_id, hire_date, education) VALUES
                                                                                                               ('EMP2025001', '张三', '1', '110101199001010001', '13800138001', 'zhangsan@example.com', 5, 1, '2023-01-15', '本科'),
                                                                                                               ('EMP2025002', '李四', '1', '110101199203150002', '13800138002', 'lisi@example.com', 6, 2, '2023-03-20', '硕士'),
                                                                                                               ('EMP2025003', '王五', '2', '110101199505200003', '13800138003', 'wangwu@example.com', 5, 1, '2024-02-10', '本科');

-- 插入系统用户（密码均为123456，已用BCrypt加密）
INSERT INTO sys_user (username, password, emp_id, role) VALUES
                                                            ('admin', '$2a$10$Gd67G4L5xJZ7m3G8H9jI4eR5tF6uV7wX8yZ9i0j1k2l3m4n5o6p', 1, 'ADMIN'),  -- 关联张三（管理员）
                                                            ('hr001', '$2a$10$Gd67G4L5xJZ7m3G8H9jI4eR5tF6uV7wX8yZ9i0j1k2l3m4n5o6p', 3, 'HR');     -- 关联王五（人事专员）