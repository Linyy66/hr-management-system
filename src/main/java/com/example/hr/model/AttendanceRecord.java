package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_attendance_record")
@Data
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 12)
    private String archiveId;

    private LocalDateTime clockTime;
    private Long shiftId;
    private String status; // PENDING / CONFIRMED / EXCEPTION
    private String exceptionType;
    private LocalDateTime createTime;
}