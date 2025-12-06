package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_org_level3")
@Data
public class OrgLevel3 {
    @Id
    @Column(length = 2)
    private String org3Id;

    @Column(length = 2, nullable = false)
    private String org2Id;

    @Column(nullable = false, length = 50)
    private String org3Name;

    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer version = 1;
}