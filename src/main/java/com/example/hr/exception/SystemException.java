package com.example.hr.exception;

/**
 * 系统异常：用于框架、数据库等底层错误（如连接失败、SQL异常）
 */
public class SystemException extends BaseException {

    /**
     * 构造方法：错误码+消息
     */
    public SystemException(int code, String message) {
        super(code, message);
    }

    /**
     * 构造方法：错误码+消息+原始异常
     */
    public SystemException(int code, String message, Throwable cause) {
        super(code, message);
        super.initCause(cause); // 保留原始异常堆栈
    }

    /**
     * 构造方法：通过错误枚举创建
     */
    public SystemException(ErrorEnum errorEnum) {
        super(errorEnum);
    }

    /**
     * 构造方法：通过错误枚举+原始异常创建
     */
    public SystemException(ErrorEnum errorEnum, Throwable cause) {
        super(errorEnum);
        super.initCause(cause);
    }

    // 常用系统异常快捷创建方法
    public static SystemException dbError(Throwable cause) {
        return new SystemException(ErrorEnum.DB_ERROR, cause);
    }

    public static SystemException fileError(String message) {
        return new SystemException(ErrorEnum.FILE_ERROR.getCode(), message);
    }
}