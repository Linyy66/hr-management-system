package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_dept_change_request")
@Data
public class DepartmentChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 12, nullable = false)
    private String archiveId;

    @Column(length = 2, nullable = false)
    private String newOrg1Id;

    @Column(length = 4, nullable = false)
    private String newOrg2Id;

    @Column(length = 6, nullable = false)
    private String newOrg3Id;

    @Column(length = 10, nullable = false)
    private String newPositionId;

    @Column(length = 2, nullable = false)
    private String currentOrg1Id;

    @Column(length = 4, nullable = false)
    private String currentOrg2Id;

    @Column(length = 6, nullable = false)
    private String currentOrg3Id;

    @Column(length = 10, nullable = false)
    private String currentPositionId;

    @Column(length = 255, nullable = false)
    private String reason;

    @Column(length = 20, nullable = false)
    private String status; // PENDING / APPROVED / REJECTED

    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer version = 1;
}