-- 更新数据库以解决字符集和默认值问题
USE hr_campus;

-- 修改所有表的字符集为utf8mb4以支持中文
ALTER TABLE t_org_level1 CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_org_level2 CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_org_level3 CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_position CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_staff_archive CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_staff_education CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_attendance_rule CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_attendance_shift CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_attendance_record CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_attendance_exception CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE t_user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 更新表结构，确保允许NULL值的字段有默认值
ALTER TABLE t_org_level1 MODIFY create_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level1 MODIFY update_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level1 MODIFY update_time DATETIME DEFAULT NULL;

ALTER TABLE t_org_level2 MODIFY create_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level2 MODIFY update_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level2 MODIFY update_time DATETIME DEFAULT NULL;

ALTER TABLE t_org_level3 MODIFY create_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level3 MODIFY update_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_org_level3 MODIFY update_time DATETIME DEFAULT NULL;

ALTER TABLE t_position MODIFY create_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_position MODIFY update_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_position MODIFY update_time DATETIME DEFAULT NULL;

ALTER TABLE t_staff_archive MODIFY create_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_staff_archive MODIFY update_by VARCHAR(20) DEFAULT NULL;
ALTER TABLE t_staff_archive MODIFY update_time DATETIME DEFAULT NULL;

-- 重新插入测试数据
DELETE FROM t_org_level1 WHERE org1_id = '01';
INSERT INTO t_org_level1 (org1_id, org1_name, create_by) VALUES ('01', '技术中心', 'admin');