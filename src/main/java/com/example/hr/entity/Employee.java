package com.example.hr.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 员工实体（对应数据库表：employee）
 */
@Data
public class Employee {
    /**
     * 员工ID（主键）
     */
    private Long id;

    /**
     * 员工姓名
     */
    private String name;

    /**
     * 性别（男/女）
     */
    private String gender;

    /**
     * 出生日期
     */
    private LocalDate birthDate;

    /**
     * 身份证号
     */
    private String idCard;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 所属部门ID（关联department表id）
     */
    private Long deptId;

    /**
     * 职位ID（关联position表id）
     */
    private Long positionId;

    /**
     * 薪资
     */
    private BigDecimal salary;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 创建人ID（关联hr_user表id）
     */
    private Long createBy;

    /**
     * 更新人ID（关联hr_user表id）
     */
    private Long updateBy;
}