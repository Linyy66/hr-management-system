package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 职位实体（对应数据库表：position）
 */
@Data
public class Position {
    /**
     * 职位ID（主键）
     */
    private Long id;

    /**
     * 职位名称（如：Java开发工程师）
     */
    private String positionName;

    /**
     * 所属部门ID（关联department表id）
     */
    private Long deptId;

    /**
     * 职位描述
     */
    private String description;

    /**
     * 排序号
     */
    private String sortOrder;

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