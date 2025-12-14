-- Minimal schema for HRMS minimal implementation
DROP DATABASE IF EXISTS hr_campus;
CREATE DATABASE hr_campus;
USE hr_campus;

CREATE TABLE IF NOT EXISTS t_org_level1 (
                                            org1_id VARCHAR(2) PRIMARY KEY,
                                            org1_name VARCHAR(50) NOT NULL,
                                            create_by VARCHAR(20),
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            update_by VARCHAR(20),
                                            update_time DATETIME,
                                            version INT DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS t_org_level2 (
                                            org2_id VARCHAR(4) PRIMARY KEY,
                                            org1_id VARCHAR(2) NOT NULL,
                                            org2_name VARCHAR(50) NOT NULL,
                                            create_by VARCHAR(20),
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            update_by VARCHAR(20),
                                            update_time DATETIME,
                                            version INT DEFAULT 1 NOT NULL,
                                            FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id)
);

CREATE TABLE IF NOT EXISTS t_org_level3 (
                                            org3_id VARCHAR(6) PRIMARY KEY,
                                            org2_id VARCHAR(4) NOT NULL,
                                            org3_name VARCHAR(50) NOT NULL,
                                            create_by VARCHAR(20),
                                            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            update_by VARCHAR(20),
                                            update_time DATETIME,
                                            version INT DEFAULT 1 NOT NULL,
                                            FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id)
);

CREATE TABLE IF NOT EXISTS t_position (
                                          position_id VARCHAR(10) PRIMARY KEY,
                                          org3_id VARCHAR(6) NOT NULL,
                                          position_name VARCHAR(50) NOT NULL,
                                          create_by VARCHAR(20),
                                          create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          update_by VARCHAR(20),
                                          update_time DATETIME,
                                          version INT DEFAULT 1 NOT NULL,
                                          FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id)
);

CREATE TABLE IF NOT EXISTS t_staff_archive (
                                               archive_id VARCHAR(12) PRIMARY KEY,
                                               org1_id VARCHAR(2) NOT NULL,
                                               org2_id VARCHAR(4) NOT NULL,
                                               org3_id VARCHAR(6) NOT NULL,
                                               position_id VARCHAR(10) NOT NULL,
                                               title CHAR(1) NOT NULL,
                                               staff_name VARCHAR(20) NOT NULL,
                                               gender CHAR(1) NOT NULL,
                                               id_card VARCHAR(18) NOT NULL,
                                               phone VARCHAR(20),
                                               mobile VARCHAR(11) NOT NULL,
                                               email VARCHAR(50),
                                               status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, NORMAL, DELETED, REJECTED
                                               create_by VARCHAR(20),
                                               create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               update_by VARCHAR(20),
                                               update_time DATETIME,
                                               version INT DEFAULT 1 NOT NULL,
                                               UNIQUE KEY uq_id_card (id_card),
                                               INDEX idx_org (org1_id, org2_id, org3_id),
                                               INDEX idx_staff_name (staff_name),
                                               FOREIGN KEY (org1_id) REFERENCES t_org_level1(org1_id),
                                               FOREIGN KEY (org2_id) REFERENCES t_org_level2(org2_id),
                                               FOREIGN KEY (org3_id) REFERENCES t_org_level3(org3_id),
                                               FOREIGN KEY (position_id) REFERENCES t_position(position_id)
);

CREATE TABLE IF NOT EXISTS t_staff_education (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 archive_id VARCHAR(12) NOT NULL,
                                                 school VARCHAR(100),
                                                 degree VARCHAR(50),
                                                 start_date DATE,
                                                 end_date DATE,
                                                 INDEX idx_archive (archive_id),
                                                 FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
);

CREATE TABLE IF NOT EXISTS t_attendance_rule (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 org1_id VARCHAR(2),
                                                 rule_json TEXT,
                                                 status VARCHAR(20) DEFAULT 'PENDING',
                                                 create_by VARCHAR(20),
                                                 create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_attendance_shift (
                                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  position_id VARCHAR(10),
                                                  shift_json TEXT,
                                                  status VARCHAR(20) DEFAULT 'PENDING',
                                                  create_by VARCHAR(20),
                                                  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  FOREIGN KEY (position_id) REFERENCES t_position(position_id)
);

CREATE TABLE IF NOT EXISTS t_attendance_record (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   archive_id VARCHAR(12),
                                                   clock_time DATETIME,
                                                   shift_id BIGINT,
                                                   status VARCHAR(20) DEFAULT 'PENDING', -- PENDING / CONFIRMED / EXCEPTION
                                                   exception_type VARCHAR(50),
                                                   create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                   FOREIGN KEY (archive_id) REFERENCES t_staff_archive(archive_id)
);

CREATE TABLE IF NOT EXISTS t_attendance_exception (
                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                      attendance_id BIGINT,
                                                      reason VARCHAR(255),
                                                      proof_url VARCHAR(255),
                                                      status VARCHAR(20) DEFAULT 'PENDING',
                                                      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                      FOREIGN KEY (attendance_id) REFERENCES t_attendance_record(id)
);

CREATE TABLE IF NOT EXISTS t_user (
                                      username VARCHAR(50) PRIMARY KEY,
                                      password VARCHAR(255) NOT NULL,
                                      role VARCHAR(30) NOT NULL,
                                      enabled TINYINT(1) NOT NULL DEFAULT 1
);