DROP TABLE IF EXISTS t_job_position; -- 与t_position重复，淘汰
DROP TABLE IF EXISTS t_first_org;    -- 与t_org_level1重复，淘汰
DROP TABLE IF EXISTS t_second_org;   -- 与t_org_level2重复，淘汰
DROP TABLE IF EXISTS t_third_org;    -- 与t_org_level3重复，淘汰
DROP TABLE IF EXISTS t_position_old; -- 若存在旧t_position表，先备份删除（可选）

-- 2. 一级机构表（保留原结构，补充注释）
CREATE TABLE IF NOT EXISTS t_org_level1 (
                                            org1_id VARCHAR(2) PRIMARY KEY COMMENT '一级机构ID（如：01=技术中心，02=市场中心）',
                                            org1_name VARCHAR(50) NOT NULL COMMENT '一级机构名称',
                                            create_by VARCHAR(20) NOT NULL COMMENT '创建人（用户名）',
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            update_by VARCHAR(20) COMMENT '更新人（用户名）',
                                            update_time DATETIME COMMENT '更新时间',
                                            version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号'
);

-- 3. 二级机构表（关联一级机构，保留审计字段）
CREATE TABLE IF NOT EXISTS t_org_level2 (
                                            org2_id VARCHAR(2) PRIMARY KEY COMMENT '二级机构ID（如：01=产品研发部，02=测试部）',
                                            org1_id VARCHAR(2) NOT NULL COMMENT '关联一级机构ID',
                                            org2_name VARCHAR(50) NOT NULL COMMENT '二级机构名称',
                                            create_by VARCHAR(20) NOT NULL COMMENT '创建人（用户名）',
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            update_by VARCHAR(20) COMMENT '更新人（用户名）',
                                            update_time DATETIME COMMENT '更新时间',
                                            version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                            FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id) ON DELETE CASCADE, -- 一级机构删除时级联删除二级
                                            UNIQUE KEY uk_org1_org2 (org1_id, org2_name) COMMENT '同一一级机构下二级名称唯一'
);

-- 4. 三级机构表（关联二级机构，补充唯一索引）
CREATE TABLE IF NOT EXISTS t_org_level3 (
                                            org3_id VARCHAR(2) PRIMARY KEY COMMENT '三级机构ID（如：01=前端组，02=后端组）',
                                            org2_id VARCHAR(2) NOT NULL COMMENT '关联二级机构ID',
                                            org3_name VARCHAR(50) NOT NULL COMMENT '三级机构名称',
                                            create_by VARCHAR(20) NOT NULL COMMENT '创建人（用户名）',
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            update_by VARCHAR(20) COMMENT '更新人（用户名）',
                                            update_time DATETIME COMMENT '更新时间',
                                            version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                            FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id) ON DELETE CASCADE, -- 二级机构删除时级联删除三级
                                            UNIQUE KEY uk_org2_org3 (org2_id, org3_name) COMMENT '同一二级机构下三级名称唯一'
);

-- 5. 职位表（核心优化：关联三级机构，淘汰旧表）
CREATE TABLE IF NOT EXISTS t_position (
                                          position_id VARCHAR(10) PRIMARY KEY COMMENT '职位ID（如：FE001=前端工程师）',
                                          org3_id VARCHAR(2) NOT NULL COMMENT '关联三级机构ID（职位归属三级机构）',
                                          position_name VARCHAR(50) NOT NULL COMMENT '职位名称（如：前端工程师、测试工程师）',
                                          create_by VARCHAR(20) NOT NULL COMMENT '创建人（用户名）',
                                          create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                          update_by VARCHAR(20) COMMENT '更新人（用户名）',
                                          update_time DATETIME COMMENT '更新时间',
                                          version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                          FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id) ON DELETE CASCADE, -- 三级机构删除时级联删除职位
                                          UNIQUE KEY uk_org3_position (org3_id, position_name) COMMENT '同一三级机构下职位名称唯一'
);

-- 6. 员工档案表（关联三级机构+职位，保留原核心字段）
CREATE TABLE IF NOT EXISTS t_staff_archive (
                                               archive_id VARCHAR(12) PRIMARY KEY COMMENT '档案编号（系统自动生成，如：202301010101）',
                                               org1_id VARCHAR(2) NOT NULL COMMENT '关联一级机构ID',
                                               org2_id VARCHAR(2) NOT NULL COMMENT '关联二级机构ID',
                                               org3_id VARCHAR(2) NOT NULL COMMENT '关联三级机构ID',
                                               position_id VARCHAR(10) NOT NULL COMMENT '关联职位ID',
                                               title CHAR(1) NOT NULL COMMENT '职称（如：初=初级，中=中级，高=高级）',
                                               staff_name VARCHAR(20) NOT NULL COMMENT '员工姓名',
                                               gender CHAR(1) NOT NULL COMMENT '性别（男/女）',
                                               id_card VARCHAR(18) NOT NULL COMMENT '身份证号（唯一）',
                                               phone VARCHAR(20) COMMENT '固定电话',
                                               mobile VARCHAR(11) NOT NULL COMMENT '手机号',
                                               email VARCHAR(50) COMMENT '邮箱',
                                               status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING=待复核，NORMAL=正常，DELETED=已删除，REJECTED=已驳回）',
                                               create_by VARCHAR(20) COMMENT '创建人（用户名）',
                                               create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                               update_by VARCHAR(20) COMMENT '更新人（用户名）',
                                               update_time DATETIME COMMENT '更新时间',
                                               version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                               UNIQUE KEY uq_id_card (id_card) COMMENT '身份证号唯一',
                                               INDEX idx_org (org1_id, org2_id, org3_id) COMMENT '机构组合索引，优化查询',
                                               INDEX idx_staff_name (staff_name) COMMENT '员工姓名索引，优化查询',
                                               FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id),
                                               FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id),
                                               FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id),
                                               FOREIGN KEY (position_id) REFERENCES t_position(position_id)
);

-- 7. 员工教育经历表（关联员工档案，无修改）
CREATE TABLE IF NOT EXISTS t_staff_education (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
                                                 archive_id VARCHAR(12) NOT NULL COMMENT '关联员工档案编号',
                                                 school VARCHAR(100) COMMENT '学校名称',
                                                 degree VARCHAR(50) COMMENT '学历（如：本科、硕士）',
                                                 start_date DATE COMMENT '入学日期',
                                                 end_date DATE COMMENT '毕业日期',
                                                 INDEX idx_archive (archive_id) COMMENT '关联档案索引',
                                                 FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id) ON DELETE CASCADE
);

-- 8. 考勤规则表（关联一级机构，无修改）
CREATE TABLE IF NOT EXISTS t_attendance_rule (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
                                                 org1_id VARCHAR(2) COMMENT '关联一级机构（统一机构规则）',
                                                 rule_json TEXT COMMENT '规则配置JSON（如：上班时间、下班时间、迟到阈值）',
                                                 status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING=待启用，NORMAL=正常）',
                                                 create_by VARCHAR(20) COMMENT '创建人（用户名）',
                                                 create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 9. 考勤班次表（关联职位，无修改）
CREATE TABLE IF NOT EXISTS t_attendance_shift (
                                                  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
                                                  position_id VARCHAR(10) COMMENT '关联职位（不同职位可能有不同班次）',
                                                  shift_json TEXT COMMENT '班次配置JSON（如：早班、晚班、双休/单休）',
                                                  status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING=待启用，NORMAL=正常）',
                                                  create_by VARCHAR(20) COMMENT '创建人（用户名）',
                                                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                  FOREIGN KEY (position_id) REFERENCES t_position(position_id) ON DELETE SET NULL
);

-- 10. 考勤记录表（关联员工档案+班次，无修改）
CREATE TABLE IF NOT EXISTS t_attendance_record (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
                                                   archive_id VARCHAR(12) COMMENT '关联员工档案编号',
                                                   clock_time DATETIME COMMENT '打卡时间',
                                                   shift_id BIGINT COMMENT '关联班次ID',
                                                   status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING=待确认，CONFIRMED=已确认，EXCEPTION=异常）',
                                                   exception_type VARCHAR(50) COMMENT '异常类型（如：迟到、早退、旷工）',
                                                   create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                   FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id) ON DELETE CASCADE,
                                                   FOREIGN KEY (shift_id) REFERENCES t_attendance_shift(id) ON DELETE SET NULL
);

-- 11. 考勤异常表（关联考勤记录，无修改）
CREATE TABLE IF NOT EXISTS t_attendance_exception (
                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
                                                      attendance_id BIGINT COMMENT '关联考勤记录ID',
                                                      reason VARCHAR(255) COMMENT '异常原因（如：生病、交通堵塞）',
                                                      proof_url VARCHAR(255) COMMENT '证明材料URL（如：病假单照片）',
                                                      status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态（PENDING=待审批，APPROVED=已通过，REJECTED=已驳回）',
                                                      create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                      FOREIGN KEY (attendance_id) REFERENCES t_attendance_record(id) ON DELETE CASCADE
);

-- 12. 用户表（保留原结构，用于权限控制）
CREATE TABLE IF NOT EXISTS t_user (
                                      username VARCHAR(50) PRIMARY KEY COMMENT '用户名（登录账号）',
                                      password VARCHAR(255) NOT NULL COMMENT '加密后的密码（如BCrypt）',
                                      role VARCHAR(30) NOT NULL COMMENT '角色（ADMIN=管理员，HR_SPEC=人事专员，HR_MANAGER=人事经理，EMPLOYEE=员工）',
                                      enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用（1=启用，0=禁用）'
);

-- 13. 插入示例数据（机构+职位，便于测试）
-- 一级机构示例
INSERT INTO t_org_level1 (org1_id, org1_name, create_by) VALUES
                                                             ('01', '技术中心', 'admin'),
                                                             ('02', '市场中心', 'admin'),
                                                             ('03', '运营中心', 'admin');

-- 二级机构示例（关联一级机构）
INSERT INTO t_org_level2 (org2_id, org1_id, org2_name, create_by) VALUES
                                                                      ('01', '01', '产品研发部', 'admin'),
                                                                      ('02', '01', '测试部', 'admin'),
                                                                      ('01', '02', '销售部', 'admin'),
                                                                      ('01', '03', '客服部', 'admin');

-- 三级机构示例（关联二级机构）
INSERT INTO t_org_level3 (org3_id, org2_id, org3_name, create_by) VALUES
                                                                      ('01', '01', '前端组', 'admin'),
                                                                      ('02', '01', '后端组', 'admin'),
                                                                      ('03', '01', '产品组', 'admin'),
                                                                      ('01', '02', '测试一组', 'admin'),
                                                                      ('01', '03', '华东销售组', 'admin'),
                                                                      ('01', '01', '客服一组', 'admin');

-- 职位示例（关联三级机构）
INSERT INTO t_position (position_id, org3_id, position_name, create_by) VALUES
                                                                            ('FE001', '01', '前端工程师', 'admin'),
                                                                            ('BE001', '02', '后端工程师', 'admin'),
                                                                            ('PM001', '03', '产品经理', 'admin'),
                                                                            ('TE001', '01', '测试工程师', 'admin'),
                                                                            ('SA001', '01', '销售代表', 'admin'),
                                                                            ('CS001', '01', '客服专员', 'admin');
-- 3. 二级机构表（补充完整）
CREATE TABLE IF NOT EXISTS t_org_level2 (
                                            org2_id VARCHAR(2) PRIMARY KEY COMMENT '二级机构ID（如：0101=前端部）',
                                            org1_id VARCHAR(2) NOT NULL COMMENT '所属一级机构ID',
                                            org2_name VARCHAR(50) NOT NULL COMMENT '二级机构名称',
                                            create_by VARCHAR(20) NOT NULL COMMENT '创建人',
                                            create_time DATETIME DEFAULT  CURRENT_TIMESTAMP COMMENT '创建时间',
                                            update_by VARCHAR(20) COMMENT '更新人',
                                            update_time DATETIME COMMENT '更新时间',
                                            version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                            FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id) ON DELETE CASCADE
);

-- 4. 三级机构表（新增）
CREATE TABLE IF NOT EXISTS t_org_level3 (
                                            org3_id VARCHAR(2) PRIMARY KEY COMMENT '三级机构ID（如：010101=前端一组）',
                                            org2_id VARCHAR(2) NOT NULL COMMENT '所属二级机构ID',
                                            org3_name VARCHAR(50) NOT NULL COMMENT '三级机构名称',
                                            create_by VARCHAR(20) NOT NULL COMMENT '创建人',
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            update_by VARCHAR(20) COMMENT '更新人',
                                            update_time DATETIME COMMENT '更新时间',
                                            version INT DEFAULT 1 NOT NULL COMMENT '乐观锁版本号',
                                            FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id) ON DELETE CASCADE
);

-- 5. 职位表（关联三级机构，修改）
CREATE TABLE IF NOT EXISTS t_position (
                                          position_id VARCHAR(5) PRIMARY KEY COMMENT '职位ID（如：FE001）',
                                          org3_id VARCHAR(2) NOT NULL COMMENT '所属三级机构ID',
                                          position_name VARCHAR(50) NOT NULL COMMENT '职位名称',
                                          overview TEXT COMMENT '职位描述',
                                          salary DECIMAL(10,2) COMMENT '薪资范围',
                                          create_by VARCHAR(20) NOT NULL COMMENT '创建人',
                                          create_time DATETIME DEFAULT
                                                                           CURRENT_TIMESTAMP COMMENT '创建时间',
                                          update_by VARCHAR(20) COMMENT '更新人',
                                          update_time DATETIME COMMENT '更新时间',
                                          FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id) ON DELETE CASCADE
);