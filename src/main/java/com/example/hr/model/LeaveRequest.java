package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_leave_request")
@Data
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String username;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(length = 1000)
    private String reason;

    @Column(length = 20)
    private String type; // ANNUAL / SICK / BUSINESS / OTHER

    @Column(length = 20)
    private String status; // PENDING / APPROVED / REJECTED

    private LocalDateTime createTime;
    private LocalDateTime reviewTime;

    @Column(length = 50)
    private String reviewer;
}