package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_org_level3")
@Data
public class OrgLevel3 {
    @Id
    @Column(length = 6)
    private String org3Id;

    @Column(name = "org2_id", length = 4, nullable = false)
    private String org2Id;

    @Column(name = "org3_name", nullable = false, length = 50)
    private String org3Name;

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
}