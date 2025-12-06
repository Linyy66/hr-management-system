package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户-角色关联实体（对应数据库表：user_role）
 * 多对多关系中间表
 */
@Data
public class UserRole {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 用户ID（关联hr_user表id）
     */
    private Long userId;

    /**
     * 角色ID（关联role表id）
     */
    private Long roleId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}