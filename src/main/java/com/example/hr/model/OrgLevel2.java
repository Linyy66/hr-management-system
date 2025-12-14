package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_org_level2")
@Data
public class OrgLevel2 {
    @Id
    @Column(name = "org2_id",length = 4,nullable = false)
    private String org2Id;

    @Column(name = "org1_id", length = 2, nullable = false)
    private String org1Id;

    @Column(name = "org2_name", nullable = false, length = 50)
    private String org2Name;

    @Column(name = "create_by")
    private String createBy;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_by")
    private String updateBy;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @Column(name = "version")
    private Integer version = 1;
    
    // 添加缺失的必需字段
    @Column(name = "org_head", length = 20)
    private String orgHead;
    
    @Column(name = "org_desc", columnDefinition = "TEXT")
    private String orgDesc;
    
    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;
}