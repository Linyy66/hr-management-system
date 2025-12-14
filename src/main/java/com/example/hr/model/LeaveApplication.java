package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_leave_application")
@Data
public class LeaveApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "archive_id", nullable = false, length = 12)
    private String archiveId;

    @Column(name = "leave_type", nullable = false, length = 20)
    private String leaveType; // ANNUAL(年假) / SICK(病假) / PERSONAL(事假) / MATERNITY(产假) / PATERNITY(陪产假) / MARRIAGE(婚假)

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "leave_days", nullable = false, precision = 5, scale = 1)
    private BigDecimal leaveDays;

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
    
    // 获取请假类型描述
    public String getLeaveTypeDescription() {
        switch (leaveType) {
            case "ANNUAL":
                return "年假";
            case "SICK":
                return "病假";
            case "PERSONAL":
                return "事假";
            case "MATERNITY":
                return "产假";
            case "PATERNITY":
                return "陪产假";
            case "MARRIAGE":
                return "婚假";
            default:
                return leaveType;
        }
    }
    
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