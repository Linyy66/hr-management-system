-- 人力资源管理系统数据库设计

-- 删除并创建数据库
DROP DATABASE IF EXISTS hr_system;
CREATE DATABASE hr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hr_system;

-- 一级机构表
CREATE TABLE t_org_level1 (
                              org1_id VARCHAR(2) PRIMARY KEY COMMENT '一级机构ID，2位数字',
                              org1_name VARCHAR(50) NOT NULL COMMENT '一级机构名称',
                              org_head VARCHAR(20) COMMENT '机构负责人',
                              org_desc TEXT COMMENT '机构描述',
                              effective_date DATETIME COMMENT '生效日期',
                              create_by VARCHAR(20) COMMENT '创建人',
                              create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              update_by VARCHAR(20) COMMENT '更新人',
                              update_time DATETIME COMMENT '更新时间',
                              version INT DEFAULT 1 NOT NULL COMMENT '版本号'
) COMMENT '一级机构表';

-- 二级机构表
CREATE TABLE t_org_level2 (
                              org2_id VARCHAR(4) PRIMARY KEY COMMENT '二级机构ID，4位数字',
                              org1_id VARCHAR(2) NOT NULL COMMENT '所属一级机构ID',
                              org2_name VARCHAR(50) NOT NULL COMMENT '二级机构名称',
                              org_head VARCHAR(20) COMMENT '机构负责人',
                              org_desc TEXT COMMENT '机构描述',
                              effective_date DATETIME COMMENT '生效日期',
                              create_by VARCHAR(20) COMMENT '创建人',
                              create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              update_by VARCHAR(20) COMMENT '更新人',
                              update_time DATETIME COMMENT '更新时间',
                              version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                              FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id)
) COMMENT '二级机构表';

-- 三级机构表
CREATE TABLE t_org_level3 (
                              org3_id VARCHAR(6) PRIMARY KEY COMMENT '三级机构ID，6位数字',
                              org2_id VARCHAR(4) NOT NULL COMMENT '所属二级机构ID',
                              org3_name VARCHAR(50) NOT NULL COMMENT '三级机构名称',
                              org_head VARCHAR(20) COMMENT '机构负责人',
                              org_desc TEXT COMMENT '机构描述',
                              effective_date DATETIME COMMENT '生效日期',
                              create_by VARCHAR(20) COMMENT '创建人',
                              create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              update_by VARCHAR(20) COMMENT '更新人',
                              update_time DATETIME COMMENT '更新时间',
                              version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                              FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id)
) COMMENT '三级机构表';

-- 职位表
CREATE TABLE t_position (
                            position_id VARCHAR(10) PRIMARY KEY COMMENT '职位ID',
                            org3_id VARCHAR(6) NOT NULL COMMENT '所属三级机构ID',
                            position_name VARCHAR(50) NOT NULL COMMENT '职位名称',
                            create_by VARCHAR(20) COMMENT '创建人',
                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                            update_by VARCHAR(20) COMMENT '更新人',
                            update_time DATETIME COMMENT '更新时间',
                            version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                            FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id)
) COMMENT '职位表';

-- 员工档案表
CREATE TABLE t_staff_archive (
                                 archive_id VARCHAR(12) PRIMARY KEY COMMENT '员工档案ID',
                                 org1_id VARCHAR(2) NOT NULL COMMENT '一级机构ID',
                                 org2_id VARCHAR(4) NOT NULL COMMENT '二级机构ID',
                                 org3_id VARCHAR(6) NOT NULL COMMENT '三级机构ID',
                                 position_id VARCHAR(10) NOT NULL COMMENT '职位ID',
                                 staff_name VARCHAR(20) NOT NULL COMMENT '员工姓名',
                                 gender CHAR(1) NOT NULL COMMENT '性别(M/F)',
                                 age INT COMMENT '年龄',
                                 bio TEXT COMMENT '自我介绍',
                                 mobile VARCHAR(11) NOT NULL COMMENT '手机号',
                                 phone VARCHAR(20) COMMENT '电话',
                                 email VARCHAR(50) COMMENT '邮箱',
                                 status VARCHAR(20) DEFAULT 'PENDING' COMMENT '员工状态(PENDING/NORMAL/DELETED/REJECTED)',
                                 create_by VARCHAR(20) COMMENT '创建人',
                                 create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 update_by VARCHAR(20) COMMENT '更新人',
                                 update_time DATETIME COMMENT '更新时间',
                                 version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                                 UNIQUE KEY uq_mobile (mobile),
                                 INDEX idx_org (org1_id, org2_id, org3_id),
                                 INDEX idx_staff_name (staff_name),
                                 FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id),
                                 FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id),
                                 FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id),
                                 FOREIGN KEY (position_id) REFERENCES t_position(position_id)
) COMMENT '员工档案表';

-- 调岗日志表
CREATE TABLE t_department_change_log (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
                                         archive_id VARCHAR(12) NOT NULL COMMENT '员工档案ID',
                                         old_org1_id VARCHAR(2) NOT NULL COMMENT '原一级机构ID',
                                         old_org2_id VARCHAR(4) NOT NULL COMMENT '原二级机构ID',
                                         old_org3_id VARCHAR(6) NOT NULL COMMENT '原三级机构ID',
                                         old_position_id VARCHAR(10) NOT NULL COMMENT '原职位ID',
                                         new_org1_id VARCHAR(2) NOT NULL COMMENT '新一级机构ID',
                                         new_org2_id VARCHAR(4) NOT NULL COMMENT '新二级机构ID',
                                         new_org3_id VARCHAR(6) NOT NULL COMMENT '新三级机构ID',
                                         new_position_id VARCHAR(10) NOT NULL COMMENT '新职位ID',
                                         change_reason TEXT COMMENT '变更原因',
                                         approval_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '审批状态(PENDING/APPROVED/REJECTED)',
                                         create_by VARCHAR(20) COMMENT '创建人',
                                         create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                         update_by VARCHAR(20) COMMENT '更新人',
                                         update_time DATETIME COMMENT '更新时间',
                                         version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                                         INDEX idx_archive (archive_id),
                                         FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
) COMMENT '调岗日志表';

-- 考勤记录表
CREATE TABLE t_attendance_record (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
                                     archive_id VARCHAR(12) NOT NULL COMMENT '员工档案ID',
                                     work_date DATE NOT NULL COMMENT '工作日期',
                                     clock_in_time DATETIME COMMENT '上班打卡时间',
                                     clock_out_time DATETIME COMMENT '下班打卡时间',
                                     status VARCHAR(20) DEFAULT 'NORMAL' COMMENT '考勤状态(NORMAL/ABSENT/LATE/EARLY_LEAVE)',
                                     create_by VARCHAR(20) COMMENT '创建人',
                                     create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     update_by VARCHAR(20) COMMENT '更新人',
                                     update_time DATETIME COMMENT '更新时间',
                                     version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                                     INDEX idx_archive_date (archive_id, work_date),
                                     FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
) COMMENT '考勤记录表';

-- 请假申请表
CREATE TABLE t_leave_application (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
                                     archive_id VARCHAR(12) NOT NULL COMMENT '员工档案ID',
                                     leave_type VARCHAR(20) NOT NULL COMMENT '请假类型(ANNUAL/SICK/PERSONAL/MATERNITY/PATERNITY/MARRIAGE)',
                                     start_date DATETIME NOT NULL COMMENT '开始时间',
                                     end_date DATETIME NOT NULL COMMENT '结束时间',
                                     leave_days DECIMAL(5,1) NOT NULL COMMENT '请假天数',
                                     reason TEXT NOT NULL COMMENT '请假原因',
                                     approval_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '审批状态(PENDING/APPROVED/REJECTED)',
                                     approver VARCHAR(20) COMMENT '审批人',
                                     approve_time DATETIME COMMENT '审批时间',
                                     create_by VARCHAR(20) COMMENT '创建人',
                                     create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     update_by VARCHAR(20) COMMENT '更新人',
                                     update_time DATETIME COMMENT '更新时间',
                                     version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                                     INDEX idx_archive (archive_id),
                                     FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
) COMMENT '请假申请表';

-- 加班申请表
CREATE TABLE t_overtime_application (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
                                        archive_id VARCHAR(12) NOT NULL COMMENT '员工档案ID',
                                        work_date DATE NOT NULL COMMENT '加班日期',
                                        start_time DATETIME NOT NULL COMMENT '开始时间',
                                        end_time DATETIME NOT NULL COMMENT '结束时间',
                                        overtime_hours DECIMAL(5,1) NOT NULL COMMENT '加班小时数',
                                        reason TEXT NOT NULL COMMENT '加班原因',
                                        approval_status VARCHAR(20) DEFAULT 'PENDING' COMMENT '审批状态(PENDING/APPROVED/REJECTED)',
                                        approver VARCHAR(20) COMMENT '审批人',
                                        approve_time DATETIME COMMENT '审批时间',
                                        create_by VARCHAR(20) COMMENT '创建人',
                                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                        update_by VARCHAR(20) COMMENT '更新人',
                                        update_time DATETIME COMMENT '更新时间',
                                        version INT DEFAULT 1 NOT NULL COMMENT '版本号',
                                        INDEX idx_archive (archive_id),
                                        FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
) COMMENT '加班申请表';

-- 用户表
CREATE TABLE t_user (
                        username VARCHAR(50) PRIMARY KEY COMMENT '用户名',
                        password VARCHAR(255) NOT NULL COMMENT '密码',
                        role VARCHAR(30) NOT NULL COMMENT '角色(ADMIN/HR_MANAGER/HR_SPECIALIST/EMPLOYEE)',
                        enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用(1:启用,0:禁用)'
) COMMENT '用户表';

-- 插入示例数据
-- 一级机构
INSERT INTO t_org_level1 (org1_id, org1_name, org_head, create_by) VALUES
                                                                       ('01', '技术中心', '张三', 'admin'),
                                                                       ('02', '人事部', '李四', 'admin');

-- 二级机构
INSERT INTO t_org_level2 (org2_id, org1_id, org2_name, org_head, create_by) VALUES
                                                                                ('0101', '01', '研发部', '王五', 'admin'),
                                                                                ('0102', '01', '测试部', '赵六', 'admin'),
                                                                                ('0201', '02', '招聘组', '钱七', 'admin');

-- 三级机构
INSERT INTO t_org_level3 (org3_id, org2_id, org3_name, org_head, create_by) VALUES
                                                                                ('010101', '0101', '后端开发组', '孙八', 'admin'),
                                                                                ('010102', '0101', '前端开发组', '周九', 'admin'),
                                                                                ('010201', '0102', '功能测试组', '吴十', 'admin');

-- 职位
INSERT INTO t_position (position_id, org3_id, position_name, create_by) VALUES
                                                                            ('P001', '010101', '高级后端工程师', 'admin'),
                                                                            ('P002', '010101', '后端工程师', 'admin'),
                                                                            ('P003', '010102', '高级前端工程师', 'admin'),
                                                                            ('P004', '010102', '前端工程师', 'admin');

-- 用户
INSERT INTO t_user (username, password, role, enabled) VALUES
                                                           ('admin', '$2a$10$w9ziBXXD3d0f46w5mkE4MeVUxdNhMr6u55KUMrYoPsuNzbx8EIyjO', 'ADMIN', 1), -- 密码: adminpass
                                                           ('hrmanager', '$2a$10$w9ziBXXD3d0f46w5mkE4MeVUxdNhMr6u55KUMrYoPsuNzbx8EIyjO', 'HR_MANAGER', 1), -- 密码: adminpass
                                                           ('hrspec', '$2a$10$w9ziBXXD3d0f46w5mkE4MeVUxdNhMr6u55KUMrYoPsuNzbx8EIyjO', 'HR_SPECIALIST', 1), -- 密码: adminpass
                                                           ('employee', '$2a$10$w9ziBXXD3d0f46w5mkE4MeVUxdNhMr6u55KUMrYoPsuNzbx8EIyjO', 'EMPLOYEE', 1); -- 密码: adminpass