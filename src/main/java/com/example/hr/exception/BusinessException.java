package com.example.hr.exception;

/**
 * 业务异常：用于业务逻辑错误（如数据不存在、参数无效）
 */
public class BusinessException extends BaseException {

    /**
     * 构造方法：错误码+消息
     */
    public BusinessException(int code, String message) {
        super(code, message);
    }

    /**
     * 构造方法：通过错误枚举创建
     */
    public BusinessException(ErrorEnum errorEnum) {
        super(errorEnum);
    }

    // 常用业务异常快捷创建方法
    public static BusinessException resourceNotFound() {
        return new BusinessException(ErrorEnum.RESOURCE_NOT_FOUND);
    }

    public static BusinessException paramError(String message) {
        return new BusinessException(ErrorEnum.PARAM_ERROR.getCode(), message);
    }

    public static BusinessException duplicateData(String message) {
        return new BusinessException(ErrorEnum.DUPLICATE_DATA.getCode(), message);
    }
}