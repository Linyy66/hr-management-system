package com.example.hr.controller;

import com.example.hr.vo.ResultVO;

/**
 * 控制器基类：封装通用方法
 */
public class BaseController {

    /**
     * 成功响应（无数据）
     */
    protected <T> ResultVO<T> success() {
        return ResultVO.success();
    }

    /**
     * 成功响应（带数据）
     */
    protected <T> ResultVO<T> success(T data) {
        return ResultVO.success(data);
    }

    /**
     * 成功响应（自定义消息+数据）
     */
    protected <T> ResultVO<T> success(String msg, T data) {
        return ResultVO.success(msg, data);
    }

    /**
     * 失败响应（错误码+消息）
     */
    protected <T> ResultVO<T> error(int code, String msg) {
        return ResultVO.error(code, msg);
    }
}