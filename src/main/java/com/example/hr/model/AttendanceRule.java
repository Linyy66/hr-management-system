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

    @Column(length = 6)
    private String org3Id;

    public void setOrg1Id(String org1Id) {
        // 为了兼容已有的API，但实际使用org3Id
    }

    @Lob
    private String ruleJson;

    private String status; // ACTIVE / INACTIVE

    private String createBy;
    private java.time.LocalDateTime createTime;
}