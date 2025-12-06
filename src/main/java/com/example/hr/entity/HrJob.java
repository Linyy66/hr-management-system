package com.example.hr.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 招聘岗位实体（对应数据库表：hr_job）
 */
@Data
public class HrJob {
    /**
     * 岗位ID（主键）
     */
    private Long id;

    /**
     * 岗位名称
     */
    private String jobName;

    /**
     * 所属部门ID（关联department表id）
     */
    private Long deptId;

    /**
     * 招聘人数
     */
    private Integer recruitNum;

    /**
     * 岗位职责
     */
    private String responsibility;

    /**
     * 任职要求
     */
    private String requirement;

    /**
     * 薪资范围（如：10k-20k）
     */
    private String salaryRange;

    /**
     * 岗位状态（1-招聘中，2-已关闭）
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 创建人ID（关联hr_user表id）
     */
    private Long createBy;

    /**
     * 更新人ID（关联hr_user表id）
     */
    private Long updateBy;
}