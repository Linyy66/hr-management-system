package com.example.hr.vo;

import lombok.Data;
import java.util.List;

/**
 * 部门展示VO（适配列表、树形组件）
 */
@Data
public class DepartmentVO {
    /** 部门ID */
    private Long id;
    /** 部门编号 */
    private String deptNo;
    /** 部门名称 */
    private String deptName;
    /** 部门描述 */
    private String deptDesc;
    /** 父部门ID（顶级部门为0） */
    private Long parentId;
    /** 父部门名称 */
    private String parentName;
    /** 部门负责人 */
    private String leader;
    /** 负责人电话 */
    private String leaderPhone;
    /** 状态（中文：启用/禁用） */
    private String status;
    /** 排序号（用于展示顺序） */
    private Integer sort;
    /** 子部门列表（树形结构用） */
    private List<DepartmentVO> children;
}