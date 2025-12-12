package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_approval")
@Data
public class Approval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Type: PROMOTION / TRANSFER / RECRUITMENT (string)
    @Column(length = 50, nullable = false)
    private String type;

    // Arbitrary JSON payload describing the proposal (position, reason, salary, target, etc.)
    @Lob
    @Column(name = "payload", columnDefinition = "text")
    private String payload;

    // submitter username
    @Column(length = 50, nullable = false)
    private String submitter;

    // status: PENDING / APPROVED / REJECTED
    @Column(length = 20, nullable = false)
    private String status;

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    @Column(length = 50)
    private String approver;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;
}