package com.example.hr.util;

import com.example.hr.vo.ResultVO;

/**
 * 响应结果工具类
 */
public class ResultUtils {

    /**
     * 成功响应（无数据）
     */
    public static <T> ResultVO<T> success() {
        return new ResultVO<>(200, "操作成功", null);
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> ResultVO<T> success(T data) {
        return new ResultVO<>(200, "操作成功", data);
    }

    /**
     * 成功响应（自定义消息+数据）
     */
    public static <T> ResultVO<T> success(String msg, T data) {
        return new ResultVO<>(200, msg, data);
    }

    /**
     * 失败响应（错误码+消息）
     */
    public static <T> ResultVO<T> error(int code, String msg) {
        return new ResultVO<>(code, msg, null);
    }
}