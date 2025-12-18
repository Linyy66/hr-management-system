package com.example.hr.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "t_staff_archive")
@Data
public class StaffArchive {
    @Id
    @Column(length = 12)
    private String archiveId;

    @Column(name = "account_id", length = 50)
    private String accountId; // 关联的用户账号ID

    @Column(name = "org1_id", length = 2, nullable = false)
    private String org1Id;

    @Column(name = "org2_id", length = 4, nullable = false)
    private String org2Id;

    @Column(name = "org3_id", length = 6, nullable = false)
    private String org3Id;

    @Column(name = "position_id", length = 10, nullable = false)
    private String positionId;

    @Column(name = "staff_name", length = 20, nullable = false)
    private String staffName;

    @Column(name = "gender", length = 1, nullable = false)
    private String gender;

    @Column(name = "age")
    private Integer age;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "mobile", length = 11, nullable = false)
    private String mobile;

    @Column(name = "id_card", length = 18)
    private String idCard;

    @Column(name = "email", length = 50)
    private String email;
    
    @Column(name = "status")
    private String status; // 员工档案状态: PENDING(待审批) / NORMAL(正常) / DELETED(已删除) / REJECTED(已拒绝) / RESIGNED(已离职) / RESIGN_PENDING(离职申请中)

    @Column(name = "create_by")
    private String createBy;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_by")
    private String updateBy;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @Column(name = "version")
    private Integer version = 1;
    
    // 反向关联，mappedBy 对应子实体的 staffArchive 字段名
    @OneToMany(mappedBy = "staffArchive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StaffEducation> educations = new ArrayList<>();
    
    // 添加是否人事专员的标识字段
    @Column(name = "is_hr_manager", length = 1)
    private String isHrManager = "N"; // Y/N
    
    // 获取state的中文描述
    public String getStatusDescription() {
        switch (status) {
            case "PENDING":
                return "待审批";
            case "NORMAL":
                return "正常";
            case "DELETED":
                return "已删除";
            case "REJECTED":
                return "已拒绝";
            case "RESIGNED":
                return "已离职";
            case "RESIGN_PENDING":
                return "离职申请中";
            default:
                return status;
        }
    }
}