package com.example.hr.exception;

import lombok.Getter;

/**
 * 异常基类：所有自定义异常的父类
 */
@Getter
public class BaseException extends RuntimeException {

    /**
     * 错误码
     */
    protected int code;

    /**
     * 错误消息
     */
    protected String message;

    /**
     * 构造方法：错误码+错误消息
     */
    public BaseException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    /**
     * 构造方法：通过错误枚举创建异常
     */
    public BaseException(ErrorEnum errorEnum) {
        super(errorEnum.getMsg());
        this.code = errorEnum.getCode();
        this.message = errorEnum.getMsg();
    }
}