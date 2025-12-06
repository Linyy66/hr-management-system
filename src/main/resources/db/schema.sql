-- 创建数据库（若不存在）
CREATE DATABASE IF NOT EXISTS hr_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hr_management;

-- 部门表
CREATE TABLE IF NOT EXISTS department (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          dept_name VARCHAR(50) NOT NULL COMMENT '部门名称',
                                          dept_desc VARCHAR(200) COMMENT '部门描述',
                                          is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0=未删，1=已删',
                                          create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                          update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '部门表';

-- 岗位表
CREATE TABLE IF NOT EXISTS position (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        pos_name VARCHAR(50) NOT NULL COMMENT '岗位名称',
                                        pos_desc VARCHAR(200) COMMENT '岗位描述',
                                        is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
                                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '岗位表';

-- 员工表
CREATE TABLE IF NOT EXISTS employee (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        name VARCHAR(50) NOT NULL COMMENT '员工姓名',
                                        dept_id BIGINT COMMENT '关联部门ID（外键）',
                                        position VARCHAR(50) COMMENT '岗位名称（可关联position表，简化版直接存名称）',
                                        hire_date DATETIME COMMENT '入职日期',
                                        is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
                                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 外键约束（可选，确保dept_id必须是department表存在的ID）
                                        CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id) REFERENCES department(id) ON DELETE SET NULL
) COMMENT '员工表';

-- 初始化测试数据（data.sql）
INSERT INTO department (dept_name, dept_desc) VALUES
                                                  ('技术部', '负责系统开发与维护'),
                                                  ('人事部', '负责员工招聘与考勤'),
                                                  ('财务部', '负责财务核算与报销');

INSERT INTO position (pos_name, pos_desc) VALUES
                                              ('Java开发工程师', '负责后端接口开发'),
                                              ('产品经理', '负责产品需求设计'),
                                              ('人事专员', '负责员工入职离职办理');

INSERT INTO employee (name, dept_id, position, hire_date) VALUES
                                                              ('张三', 1, 'Java开发工程师', '2023-01-15 09:00:00'),
                                                              ('李四', 2, '人事专员', '2023-03-20 10:30:00'),
                                                              ('王五', 1, '产品经理', '2023-05-10 08:45:00');