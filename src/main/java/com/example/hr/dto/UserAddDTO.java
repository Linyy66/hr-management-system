package com.example.hr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户新增请求DTO（系统用户，如管理员、HR）
 */
@Data
public class UserAddDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名长度必须在4-20个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    private String username; // 登录用户名

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度必须在6-32个字符之间")
    private String password; // 登录密码（明文，后端会加密存储）

    @NotBlank(message = "真实姓名不能为空")
    @Size(max = 20, message = "真实姓名长度不能超过20个字符")
    private String realName; // 真实姓名

    @NotBlank(message = "角色不能为空")
    @Pattern(regexp = "^(ADMIN|HR|USER)$", message = "角色必须是ADMIN、HR或USER")
    private String role; // 角色

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone; // 联系电话（可选）

    private Boolean status = true; // 状态（默认启用：true-启用，false-禁用）
}