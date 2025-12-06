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

    @Column(length = 2, nullable = false)
    private String org1Id;

    @Column(length = 2, nullable = false)
    private String org2Id;

    @Column(length = 2, nullable = false)
    private String org3Id;

    @Column(length = 10, nullable = false)
    private String positionId;

    @Column(length = 1, nullable = false)
    private String title;

    @Column(length = 20, nullable = false)
    private String staffName;

    @Column(length = 1, nullable = false)
    private String gender;

    @Column(length = 18, nullable = false, unique = true)
    private String idCard;

    private String phone;

    @Column(length = 11, nullable = false)
    private String mobile;

    private String email;

    private String status; // PENDING / NORMAL / DELETED / REJECTED

    private String createBy;
    private LocalDateTime createTime;
    private String updateBy;
    private LocalDateTime updateTime;
    private Integer version = 1;

    // 反向关联，mappedBy 对应子实体的 staffArchive 字段名
    @OneToMany(mappedBy = "staffArchive", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StaffEducation> educations = new ArrayList<>();
}