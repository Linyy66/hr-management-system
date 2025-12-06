package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "t_attendance_shift")
@Data
public class AttendanceShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 10)
    private String positionId;

    @Lob
    private String shiftJson;

    private String status;

    private String createBy;
    private java.time.LocalDateTime createTime;
}