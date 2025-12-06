package com.example.hr.dto;

import lombok.Data;

/**
 * 登录响应DTO（包含令牌信息）
 */
@Data
public class LoginResponseDTO {

    private String token; // 访问令牌（JWT）

    private String refreshToken; // 刷新令牌

    private Long expireTime; // 令牌过期时间（毫秒时间戳）

    private UserInfoDTO userInfo; // 当前登录用户基本信息
}

// 内部类：用户基本信息
@Data
class UserInfoDTO {
    private Long id; // 用户ID
    private String username; // 用户名
    private String realName; // 真实姓名
    private String role; // 角色（如ADMIN/HR/USER）
    private String avatar; // 头像URL
}