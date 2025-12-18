package com.example.hr.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_employee_profile")
@Data
public class EmployeeProfile {
    @Id
    @Column(length = 12)
    private String profileId;

    @Column(name = "account_id", length = 50, unique = true)
    private String accountId; // 关联的用户账号ID

    @Column(name = "staff_name", length = 20)
    private String staffName;

    @Column(name = "gender", length = 1)
    private String gender;

    @Column(name = "age")
    private Integer age;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "mobile", length = 11)
    private String mobile;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 50)
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @Column(name = "version")
    private Integer version = 1;
}