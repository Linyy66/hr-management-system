package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "t_attendance_rule")
@Data
public class AttendanceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2)
    private String org1Id;

    @Lob
    private String ruleJson;

    private String status; // PENDING / APPROVED / REJECTED

    private String createBy;
    private java.time.LocalDateTime createTime;
}