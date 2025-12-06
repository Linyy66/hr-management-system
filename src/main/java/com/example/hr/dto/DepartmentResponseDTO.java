package com.example.hr.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部门响应DTO（用于接口返回）
 */
@Data
public class DepartmentResponseDTO {

    private Long id; // 部门ID

    private String deptName; // 部门名称

    private String description; // 部门描述

    private Long parentId; // 父部门ID

    private String parentName; // 父部门名称（冗余字段，便于前端展示）

    private String sortOrder; // 排序号

    private LocalDateTime createTime; // 创建时间

    private LocalDateTime updateTime; // 更新时间

    // 子部门列表（用于树形结构展示）
    private List<DepartmentResponseDTO> children;
}