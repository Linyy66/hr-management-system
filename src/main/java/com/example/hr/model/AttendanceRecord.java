package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_attendance")
@Data
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String username;

    @Column(length = 50)
    private String positionId; // 被选择的岗位ID

    private LocalDate date; // 考勤日期

    @Column(length = 30)
    private String type; // WORK / LEAVE / BUSINESS / OTHER

    private LocalDateTime timestamp; // 打卡时间或记录时间

    @Column(length = 1000)
    private String note;
}