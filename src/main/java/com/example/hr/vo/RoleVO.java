package com.example.hr.vo;

import lombok.Data;
import java.util.List;

/**
 * 角色展示VO
 */
@Data
public class RoleVO {
    /** 角色ID */
    private Long id;
    /** 角色编码 */
    private String roleCode;
    /** 角色名称 */
    private String roleName;
    /** 角色描述 */
    private String roleDesc;
    /** 状态（中文：启用/禁用） */
    private String status;
    /** 关联权限名称列表 */
    private List<String> permNames;
}