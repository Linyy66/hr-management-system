package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 角色实体（对应数据库表：role）
 */
@Data
public class Role {
    /**
     * 角色ID（主键）
     */
    private Long id;

    /**
     * 角色名称（如：ADMIN、HR、USER）
     */
    private String roleName;

    /**
     * 角色描述
     */
    private String description;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}