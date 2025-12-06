package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_attendance_exception")
@Data
public class AttendanceException {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long attendanceId;
    private String reason;
    private String proofUrl;
    private String status; // PENDING / APPROVED / REJECTED
    private LocalDateTime createTime;
}