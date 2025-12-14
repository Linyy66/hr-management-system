-- 解决数据库问题的脚本
-- 1. 修正表结构，确保所有字段都有适当的默认值

-- 删除现有表（如果存在），按正确顺序删除外键依赖
DROP TABLE IF EXISTS t_attendance_exception;
DROP TABLE IF EXISTS t_attendance_record;
DROP TABLE IF EXISTS t_attendance_shift;
DROP TABLE IF EXISTS t_attendance_rule;
DROP TABLE IF EXISTS t_user;
DROP TABLE IF EXISTS t_role;
DROP TABLE IF EXISTS t_position;
DROP TABLE IF EXISTS t_org_level3;
DROP TABLE IF EXISTS t_org_level2;
DROP TABLE IF EXISTS t_org_level1;

-- 重新创建表结构
-- 一级机构表
CREATE TABLE t_org_level1 (
    org1_id VARCHAR(2) PRIMARY KEY,
    org1_name VARCHAR(50) NOT NULL,
    create_by VARCHAR(20) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_by VARCHAR(20) DEFAULT NULL,
    update_time DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    version INT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 二级机构表
CREATE TABLE t_org_level2 (
    org2_id VARCHAR(4) PRIMARY KEY,
    org1_id VARCHAR(2) NOT NULL,
    org2_name VARCHAR(50) NOT NULL,
    create_by VARCHAR(20) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_by VARCHAR(20) DEFAULT NULL,
    update_time DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 三级机构表
CREATE TABLE t_org_level3 (
    org3_id VARCHAR(6) PRIMARY KEY,
    org2_id VARCHAR(4) NOT NULL,
    org3_name VARCHAR(50) NOT NULL,
    create_by VARCHAR(20) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_by VARCHAR(20) DEFAULT NULL,
    update_time DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职位表
CREATE TABLE t_position (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org3_id VARCHAR(6) NOT NULL,
    position_name VARCHAR(50) NOT NULL,
    create_by VARCHAR(20) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_by VARCHAR(20) DEFAULT NULL,
    update_time DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    version INT DEFAULT 1,
    FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 角色表
CREATE TABLE t_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户表
CREATE TABLE t_user (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (role_id) REFERENCES t_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 考勤规则表
CREATE TABLE t_attendance_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org1_id VARCHAR(2) NOT NULL,
    rule_json TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入基础角色数据
INSERT INTO t_role (name) VALUES ('EMPLOYEE'), ('HR_SPEC'), ('HR_MANAGER'), ('ADMIN');

-- 插入管理员用户
INSERT INTO t_user (username, password, role_id, enabled) VALUES ('admin', '$2a$10$rOzJqQZ6b6Z6hC6V6G6J6u6V6G6J6u6V6G6J6u6V6G6J6u6V6G6', 4, TRUE);

-- 插入示例机构数据
INSERT INTO t_org_level1 (org1_id, org1_name, create_by) VALUES ('01', '技术中心', 'admin');
INSERT INTO t_org_level2 (org2_id, org1_id, org2_name, create_by) VALUES ('0101', '01', '研发部', 'admin');
INSERT INTO t_org_level3 (org3_id, org2_id, org3_name, create_by) VALUES ('010101', '0101', 'Java开发组', 'admin');