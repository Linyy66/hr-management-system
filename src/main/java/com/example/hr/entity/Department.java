package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 部门实体（对应数据库表：department）
 */
@Data
public class Department {
    /**
     * 部门ID（主键）
     */
    private Long id;

    /**
     * 部门名称
     */
    private String deptName;

    /**
     * 部门描述
     */
    private String description;

    /**
     * 父部门ID（自关联，顶级部门为null）
     */
    private Long parentId;

    /**
     * 排序号（用于展示排序）
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