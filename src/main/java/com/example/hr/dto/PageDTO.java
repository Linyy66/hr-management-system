package com.example.hr.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 分页查询通用参数DTO
 * 所有分页接口可继承此类，减少重复代码
 */
@Data
public class PageDTO {

    @Min(value = 1, message = "页码不能小于1")
    private Integer pageNum = 1; // 页码（默认第1页）

    @Min(value = 1, message = "每页条数不能小于1")
    private Integer pageSize = 10; // 每页条数（默认10条）

    // 排序字段（可选，如"createTime"）
    private String sortField;

    // 排序方向（可选，asc/desc，默认asc）
    private String sortDirection = "asc";
}