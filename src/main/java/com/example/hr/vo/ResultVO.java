package com.example.hr.vo;

import lombok.Data;

/**
 * 全局统一响应VO（所有接口返回此格式）
 * 优化点：
 * 1. 补充全参数重载方法，适配所有业务场景
 * 2. 兼容int/Integer错误码，避免类型转换问题
 * 3. 支持错误码枚举，规范错误码使用
 * 4. 简化方法调用逻辑，减少冗余
 */
@Data
public class ResultVO<T> {
    /** 响应码：200=成功，其他=失败（如400=参数错误，401=未授权，403=无权限，500=系统异常） */
    private Integer code;
    /** 响应信息（成功/失败提示） */
    private String msg;
    /** 响应数据（成功时返回业务数据，失败时可返回错误详情） */
    private T data;

    // ====================== 成功响应（重载方法） ======================
    /**
     * 成功响应（无数据，默认提示）
     */
    public static <T> ResultVO<T> success() {
        return success("操作成功", null);
    }

    /**
     * 成功响应（带数据，默认提示）
     */
    public static <T> ResultVO<T> success(T data) {
        return success("操作成功", data);
    }

    /**
     * 成功响应（自定义提示+数据）
     */
    public static <T> ResultVO<T> success(String msg, T data) {
        ResultVO<T> result = new ResultVO<>();
        result.setCode(200);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    // ====================== 失败响应（重载方法） ======================
    /**
     * 失败响应（默认提示+默认码500，无数据）
     */
    public static <T> ResultVO<T> error() {
        return error(500, "操作失败", null);
    }

    /**
     * 失败响应（自定义提示，默认码500，无数据）
     */
    public static <T> ResultVO<T> error(String msg) {
        return error(500, msg, null);
    }

    /**
     * 失败响应（自定义提示+数据，默认码500）
     */
    public static <T> ResultVO<T> error(String msg, T data) {
        return error(500, msg, data);
    }

    /**
     * 失败响应（自定义码+提示，无数据）
     * 兼容int/Integer：参数用int（自动装箱），避免手动转Integer
     */
    public static <T> ResultVO<T> error(int code, String msg) {
        return error(code, msg, null);
    }

    /**
     * 失败响应（全参数：自定义码+提示+数据）【核心底层方法】
     * 所有失败响应最终调用此方法，减少冗余
     */
    public static <T> ResultVO<T> error(int code, String msg, T data) {
        ResultVO<T> result = new ResultVO<>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    // ====================== 扩展：对接错误码枚举（可选，推荐） ======================
    /**
     * 失败响应（通过错误码枚举调用，规范错误码）
     * @param errorEnum 错误码枚举（如 ErrorEnum.PARAM_ERROR）
     */
    public static <T> ResultVO<T> error(ErrorEnum errorEnum) {
        return error(errorEnum.getCode(), errorEnum.getMsg(), null);
    }

    /**
     * 失败响应（错误码枚举+自定义数据）
     */
    public static <T> ResultVO<T> error(ErrorEnum errorEnum, T data) {
        return error(errorEnum.getCode(), errorEnum.getMsg(), data);
    }

    // ====================== 可选：错误码枚举示例（建议单独放在exception包） ======================
    /**
     * 错误码枚举（可单独抽离为 com.example.hr.exception.ErrorEnum）
     */
    public enum ErrorEnum {
        SUCCESS(200, "操作成功"),
        PARAM_ERROR(400, "参数错误"),
        UNAUTHORIZED(401, "未授权，请登录"),
        FORBIDDEN(403, "无权限执行此操作"),
        RESOURCE_NOT_FOUND(404, "资源不存在"),
        SERVER_ERROR(500, "服务器内部异常");

        private final int code;
        private final String msg;

        ErrorEnum(int code, String msg) {
            this.code = code;
            this.msg = msg;
        }

        public int getCode() {
            return code;
        }

        public String getMsg() {
            return msg;
        }
    }
}