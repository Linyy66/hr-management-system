package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_org_level1")
@Data
public class OrgLevel1 {
    @Id
    @Column(length = 2)
    private String org1Id;

    @Column(nullable = false, length = 50)
    private String org1Name;

    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer version = 1;
}