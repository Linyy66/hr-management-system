package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统用户实体（对应数据库表：hr_user）
 */
@Data
public class HrUser {
    /**
     * 用户ID（主键）
     */
    private Long id;

    /**
     * 登录用户名
     */
    private String username;

    /**
     * 加密后的密码（BCrypt加密）
     */
    private String password;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 用户状态（true-启用，false-禁用）
     */
    private Boolean status;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 创建人ID（关联自身id）
     */
    private Long createBy;

    /**
     * 更新人ID（关联自身id）
     */
    private Long updateBy;
}