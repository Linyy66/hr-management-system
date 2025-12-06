package com.example.hr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 部门新增请求DTO
 */
@Data
public class DepartmentAddDTO {

    @NotBlank(message = "部门名称不能为空")
    @Size(max = 50, message = "部门名称长度不能超过50个字符")
    private String deptName; // 部门名称

    @Size(max = 200, message = "部门描述长度不能超过200个字符")
    private String description; // 部门描述

    private Long parentId; // 父部门ID（可选，顶级部门为null）

    @Size(max = 10, message = "部门排序号长度不能超过10个字符")
    private String sortOrder; // 排序号（用于展示排序）
}