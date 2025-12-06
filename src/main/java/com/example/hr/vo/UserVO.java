package com.example.hr.vo;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 系统用户展示VO
 */
@Data
public class UserVO {
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
    /** 状态（中文：启用/禁用） */
    private String status;
    /** 最后登录时间 */
    private Date lastLoginTime;
    /** 最后登录IP */
    private String lastLoginIp;
    /** 关联角色名称列表 */
    private List<String> roleNames;
}