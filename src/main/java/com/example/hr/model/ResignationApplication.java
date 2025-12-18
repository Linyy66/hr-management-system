package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_resignation_application")
@Data
public class ResignationApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "archive_id", length = 12, nullable = false)
    private String archiveId;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "approval_status", length = 20, nullable = false)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "approver", length = 50)
    private String approver;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // 获取审批状态的中文描述
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
    
    // 添加关联的员工档案字段（不持久化到数据库）
    @Transient
    private String applicantName;
    
    public String getApplicantName() {
        return applicantName;
    }
    
    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }
}