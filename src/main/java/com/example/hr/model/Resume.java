package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate; // 新增导入
import java.time.LocalDateTime;

@Entity
@Table(name = "t_resume")
@Data
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String username;

    // 个人信息字段
    @Column(length = 100)
    private String fullName;

    @Column(length = 10)
    private String gender;

    // 新增出生日期字段
    private LocalDate birthDate; // 关键修复：添加此字段

    @Column(length = 50)
    private String ethnicity;

    @Column(length = 100)
    private String education;

    @Column(length = 2000)
    private String experience;

    // 注意：原代码中没有 skills 字段，控制器中调用了 getSkills()，此处也需要补充
    @Column(length = 1000)
    private String skills; // 补充 skills 字段（否则会出现同样的"找不到符号"错误）

    @Column(length = 100)
    private String mobile;

    @Column(length = 100)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String appliedPositionIds;

    @Column(length = 2000)
    private String coverLetter;

    @Column(length = 20)
    private String status;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}