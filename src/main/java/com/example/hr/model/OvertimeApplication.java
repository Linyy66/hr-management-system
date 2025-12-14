package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_overtime_application")
@Data
public class OvertimeApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "archive_id", nullable = false, length = 12)
    private String archiveId;

    @Column(name = "work_date", nullable = false)
    private java.time.LocalDate workDate;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "overtime_hours", nullable = false, precision = 5, scale = 1)
    private BigDecimal overtimeHours;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus; // 审批状态: PENDING(待审批) / APPROVED(已批准) / REJECTED(已拒绝)

    @Column(name = "approver", length = 20)
    private String approver;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;

    @Column(name = "create_by", length = 20)
    private String createBy;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_by", length = 20)
    private String updateBy;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @Column(name = "version")
    private Integer version = 1;
    
    // 获取审批状态描述
    public String getApprovalStatusDescription() {
        switch (approvalStatus) {
            case "PENDING":
                return "待审批";
            case "APPROVED":
                return "已批准";
            case "REJECTED":
                return "已拒绝";
            default:
                return approvalStatus;
        }
    }
}