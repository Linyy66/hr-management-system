package com.example.hr.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 部门更新请求DTO
 */
@Data
public class DepartmentUpdateDTO {

    @Size(max = 50, message = "部门名称长度不能超过50个字符")
    private String deptName; // 部门名称（可选，不为空则更新）

    @Size(max = 200, message = "部门描述长度不能超过200个字符")
    private String description; // 部门描述（可选）

    private Long parentId; // 父部门ID（可选）

    @Size(max = 10, message = "部门排序号长度不能超过10个字符")
    private String sortOrder; // 排序号（可选）
}