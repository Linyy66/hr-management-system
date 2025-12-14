package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_overtime_application")
@Data
public class OvertimeApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private LocalDateTime overtimeDate;

    @Column(nullable = false)
    private Double hours;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @Column
    private String approverId;

    @Column
    private LocalDateTime createTime;

    @Column
    private LocalDateTime updateTime;
    
    @Column
    private LocalDateTime approveTime;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getOvertimeDate() {
        return overtimeDate;
    }

    public void setOvertimeDate(LocalDateTime overtimeDate) {
        this.overtimeDate = overtimeDate;
    }

    public Double getHours() {
        return hours;
    }

    public void setHours(Double hours) {
        this.hours = hours;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApproverId() {
        return approverId;
    }

    public void setApproverId(String approverId) {
        this.approverId = approverId;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public LocalDateTime getApproveTime() {
        return approveTime;
    }

    public void setApproveTime(LocalDateTime approveTime) {
        this.approveTime = approveTime;
    }
}