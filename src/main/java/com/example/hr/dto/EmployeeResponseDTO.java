package com.example.hr.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * 员工响应DTO（用于接口返回）
 */
@Data
public class EmployeeResponseDTO {

    private Long id; // 员工ID

    private String name; // 姓名

    private String gender; // 性别

    private LocalDate birthDate; // 出生日期

    private String idCard; // 身份证号

    private String phone; // 联系电话

    private Long deptId; // 部门ID

    private String deptName; // 部门名称（冗余字段）

    private Long positionId; // 职位ID

    private String positionName; // 职位名称（冗余字段）

    private BigDecimal salary; // 薪资

    private String remark; // 备注

    private String avatar; // 头像URL（可选）

    private LocalDateTime createTime; // 创建时间

    private LocalDateTime updateTime; // 更新时间
}