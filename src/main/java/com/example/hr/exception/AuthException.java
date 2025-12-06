package com.example.hr.exception;

/**
 * 认证异常：用于登录、权限相关错误（如token失效、未授权）
 */
public class AuthException extends BaseException {

    /**
     * 构造方法：错误码+消息
     */
    public AuthException(int code, String message) {
        super(code, message);
    }

    /**
     * 构造方法：通过错误枚举创建
     */
    public AuthException(ErrorEnum errorEnum) {
        super(errorEnum);
    }

    // 常用认证异常快捷创建方法
    public static AuthException invalidToken() {
        return new AuthException(ErrorEnum.INVALID_TOKEN);
    }

    public static AuthException unauthorized() {
        return new AuthException(ErrorEnum.UNAUTHORIZED);
    }

    public static AuthException forbidden() {
        return new AuthException(ErrorEnum.FORBIDDEN);
    }
}