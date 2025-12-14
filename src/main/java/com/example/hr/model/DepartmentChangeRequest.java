package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_department_change_log")
@Data
public class DepartmentChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "archive_id", nullable = false, length = 12)
    private String archiveId;

    @Column(name = "old_org1_id", nullable = false, length = 2)
    private String oldOrg1Id;

    @Column(name = "old_org2_id", nullable = false, length = 4)
    private String oldOrg2Id;

    @Column(name = "old_org3_id", nullable = false, length = 6)
    private String oldOrg3Id;

    @Column(name = "old_position_id", nullable = false, length = 10)
    private String oldPositionId;

    @Column(name = "new_org1_id", nullable = false, length = 2)
    private String newOrg1Id;

    @Column(name = "new_org2_id", nullable = false, length = 4)
    private String newOrg2Id;

    @Column(name = "new_org3_id", nullable = false, length = 6)
    private String newOrg3Id;

    @Column(name = "new_position_id", nullable = false, length = 10)
    private String newPositionId;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus; // 审批状态: PENDING(待审批) / APPROVED(已批准) / REJECTED(已拒绝)

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