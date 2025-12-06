package com.example.hr.vo;

import lombok.Data;
import java.util.List;

/**
 * 登录结果VO（包含Token和用户信息）
 */
@Data
public class LoginVO {
    /** JWT令牌 */
    private String token;
    /** 令牌过期时间（毫秒） */
    private Long expireTime;
    /** 用户基本信息 */
    private UserInfoVO userInfo;

    /** 嵌套：用户信息子VO */
    @Data
    public static class UserInfoVO {
        /** 用户ID */
        private Long id;
        /** 登录用户名 */
        private String username;
        /** 真实姓名 */
        private String name;
        /** 联系电话 */
        private String phone;
        /** 邮箱 */
        private String email;
        /** 角色列表（如：["ADMIN", "HR"]） */
        private List<String> roles;
        /** 权限列表（如：["emp:query", "dept:add"]） */
        private List<String> permissions;
    }
}