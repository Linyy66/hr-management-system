package com.example.hr.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 员工查询请求DTO（用于条件筛选）
 */
@Data
public class EmployeeQueryDTO {

    private String name; // 姓名（模糊查询）

    private String gender; // 性别（精确匹配）

    private Long deptId; // 部门ID（精确匹配）

    private Long positionId; // 职位ID（精确匹配）

    private LocalDate startBirthDate; // 出生日期起始（>=）

    private LocalDate endBirthDate; // 出生日期结束（<=）

    private BigDecimal minSalary; // 最小薪资（>=）

    private BigDecimal maxSalary; // 最大薪资（<=）
}