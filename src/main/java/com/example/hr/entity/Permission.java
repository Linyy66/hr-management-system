package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 权限实体（对应数据库表：permission）
 */
@Data
public class Permission {
    /**
     * 权限ID（主键）
     */
    private Long id;

    /**
     * 权限名称（如：user:add）
     */
    private String permissionName;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 父权限ID（自关联，顶级权限为null）
     */
    private Long parentId;

    /**
     * 权限类型（1-菜单，2-按钮）
     */
    private Integer type;

    /**
     * 路由路径（用于前端路由）
     */
    private String path;

    /**
     * 组件路径（用于前端组件）
     */
    private String component;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}