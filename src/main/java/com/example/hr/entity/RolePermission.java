package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 角色-权限关联实体（对应数据库表：role_permission）
 * 多对多关系中间表
 */
@Data
public class RolePermission {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 角色ID（关联role表id）
     */
    private Long roleId;

    /**
     * 权限ID（关联permission表id）
     */
    private Long permissionId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}