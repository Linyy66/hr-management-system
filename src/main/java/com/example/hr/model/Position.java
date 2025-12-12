package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "t_position") // 与数据库表名一致
public class Position {
    // 主键：职位ID（与数据库t_position.position_id对应）
    @Id
    @Column(name = "position_id", length = 10, nullable = false)
    private String positionId;

    // 关联三级机构ID（核心关联字段，与t_org_level3.org3_id对应）
    @Column(name = "org3_id", length = 2, nullable = false)
    private String org3Id;

    // 职位名称（与数据库t_position.position_name对应）
    @Column(name = "position_name", length = 50, nullable = false)
    private String positionName;

    // 职位概述（补充字段，来自JobPosition）
    @Column(name = "overview")
    private String overview;

    // 薪资（补充字段，来自JobPosition，使用Double存储数值）
    @Column(name = "salary")
    private Double salary;

    // 审计字段：创建人
    @Column(name = "create_by", length = 20)
    private String createBy;

    // 审计字段：创建时间（自动生成）
    @Column(name = "create_time")
    private LocalDateTime createTime;

    // 审计字段：更新人
    @Column(name = "update_by", length = 20)
    private String updateBy;

    // 审计字段：更新时间（自动更新）
    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // 乐观锁版本号（来自原Position类，用于并发控制）
    @Column(name = "version")
    private Integer version = 1;

    // 新增：保存前自动设置创建时间
    @PrePersist
    public void prePersist() {
        this.createTime = LocalDateTime.now();
    }

    // 新增：更新前自动设置更新时间
    @PreUpdate
    public void preUpdate() {
        this.updateTime = LocalDateTime.now();
    }
}