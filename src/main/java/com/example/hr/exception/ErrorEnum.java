package com.example.hr.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 错误码枚举：统一管理系统所有错误码和消息
 * 编码规则：
 * - 200：成功
 * - 4xx：客户端错误（如400参数错、401未授权）
 * - 5xx：服务端错误（如500系统错、501数据库错）
 * - 6xx：业务错误（如601数据不存在、602重复数据）
 */
@Getter
@AllArgsConstructor
public enum ErrorEnum {

    // ========== 通用错误 ==========
    SUCCESS(200, "操作成功"),
    SYSTEM_ERROR(500, "系统内部异常"),
    PARAM_ERROR(400, "参数校验失败"),
    RESOURCE_NOT_FOUND(404, "资源不存在"),

    // ========== 认证权限错误 ==========
    UNAUTHORIZED(401, "未登录或登录已过期"),
    INVALID_TOKEN(401, "无效的令牌"),
    FORBIDDEN(403, "没有权限执行此操作"),

    // ========== 业务错误 ==========
    DUPLICATE_DATA(601, "数据已存在"),
    DATA_CANNOT_DELETE(602, "数据关联其他资源，无法删除"),
    PASSWORD_ERROR(603, "密码错误"),
    USER_DISABLED(604, "用户已被禁用"),

    // ========== 系统组件错误 ==========
    DB_ERROR(501, "数据库操作异常"),
    FILE_ERROR(502, "文件操作异常"),
    NETWORK_ERROR(503, "网络请求异常");

    /**
     * 错误码
     */
    private final int code;

    /**
     * 错误消息
     */
    private final String msg;
}